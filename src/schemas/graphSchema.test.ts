import { describe, it } from "node:test";
import assert from "node:assert/strict";
import graph from "../data/graph.json";
import tourDocument from "../data/tours.json";
import { validateData } from "./graphSchema";
import { buildGraph, displayNodeSize } from "../graph/buildGraph";
import { nodeTypes, edgeTypes } from "../types/graph";
import { matchesNodeQuery } from "../components/Search/Search";
import {
  TOUR_PROGRESS_STORAGE_KEY,
  completeTour,
  progressAtStep,
  readTourProgress,
  tourActionLabel,
  writeTourProgress,
} from "../tours/tourProgress";

describe("dataset integrity", () => {
  it("loads all v0.8 nodes, edges and tours without changing supplied fields", () => {
    const result = validateData(graph, tourDocument);
    assert.equal(result.data.demo, false);
    assert.equal(result.data.meta?.version, "0.8.0");
    assert.equal(result.tourMeta?.version, "0.8.0");
    assert.equal(result.data.nodes.length, 152);
    assert.equal(result.data.edges.length, 346);
    assert.equal(result.tours.length, 6);
    assert.equal(
      result.tours.reduce((total, tour) => total + tour.steps.length, 0),
      61,
    );
    assert.deepEqual(
      result.tours.map((tour) => tour.title),
      [
        "Van techniek naar regie",
        "Technologie als expressie",
        "AI: van kunnen naar vertrouwen",
        "Wie stuurt mijn keuzes?",
        "Van één signaal naar een kans",
        "Van trends naar meerdere kansrichtingen",
      ],
    );
    assert.equal(
      result.data.nodes.filter((node) => node.type === "opportunity").length,
      21,
    );
    assert.equal(
      result.data.nodes.filter((node) => node.status === "selected_main_trend")
        .length,
      3,
    );
    assert.ok(result.data.nodes.some((node) => node.id === "S63"));
    assert.ok(result.data.nodes.some((node) => node.id === "S64"));
    assert.ok(result.data.nodes.some((node) => node.id === "C_ALGO_RECOMMEND"));
    assert.ok(result.data.nodes.some((node) => node.id === "C_ALGO_PRICING"));
    assert.equal(
      result.data.nodes.filter((node) => node.status === "idea_direction")
        .length,
      15,
    );
    assert.equal(
      result.data.nodes.filter((node) => node.status === "explored_direction")
        .length,
      3,
    );
    assert.equal(
      result.data.nodes.filter(
        (node) => node.status === "shortlisted_direction",
      ).length,
      3,
    );
    assert.deepEqual(
      result.data.nodes.map(({ importance: _default, ...node }) => node),
      graph.nodes,
    );
    assert.deepEqual(result.data.edges, graph.edges);
    assert.deepEqual(result.data.meta, graph.meta);
    assert.deepEqual(result.tours, tourDocument.tours);
    assert.deepEqual(result.tourMeta, tourDocument.meta);
  });
  it("supports display IDs, aliases, references, the matrix and all Kanschecks", () => {
    const { data } = validateData(graph, tourDocument);
    for (const query of ["S12", "S42", "S63"]) {
      const matches = data.nodes.filter((node) =>
        matchesNodeQuery(node, query),
      );
      assert.equal(matches.length, 1);
      assert.equal(matches[0].displayId, query);
    }
    const matrix = data.nodes.find((node) => node.id === "SC_AI_MATRIX");
    assert.equal(matrix?.visualization?.type, "matrix2x2");
    assert.equal(matrix?.visualization?.quadrants.length, 4);
    assert.equal(
      data.nodes.filter((node) => node.opportunityAssessment).length,
      3,
    );
    assert.ok(data.nodes.some((node) => node.references?.length));
  });
  it("preserves dated, undated and accessed source metadata", () => {
    const { data } = validateData(graph, tourDocument);
    for (const raw of graph.nodes) {
      if ("source" in raw)
        assert.deepEqual(
          data.nodes.find((n) => n.id === raw.id)?.source,
          raw.source,
        );
    }
    assert.ok(data.nodes.some((n) => n.source?.date === "2026"));
    assert.equal(
      data.nodes.filter((n) => n.source?.date === "z.d.").length,
      45,
    );
    assert.ok(data.nodes.some((n) => n.source?.accessedDate === "2026-10-04"));
    assert.ok(data.nodes.some((n) => n.source?.url === ""));
  });
  it("preserves the distinct summary and enriched body for every node", () => {
    const { data } = validateData(graph, tourDocument);
    for (const node of data.nodes) {
      assert.ok(node.summary);
      assert.ok(node.body);
      assert.notEqual(node.summary, node.body);
    }
  });
  it("supports every category and relation independently of dataset coverage", () => {
    const nodes = nodeTypes.map((type) => ({ id: type, type, title: type }));
    const edges = edgeTypes.map((type) => ({
      id: type,
      type,
      source: "signal",
      target: "trend",
    }));
    assert.equal(
      validateData({ demo: true, nodes, edges }, []).data.edges.length,
      edgeTypes.length,
    );
  });
  it("rejects dangling edges and duplicate IDs", () => {
    assert.throws(() =>
      validateData(
        { ...graph, edges: [{ ...graph.edges[0], target: "missing" }] },
        tourDocument,
      ),
    );
    assert.throws(() =>
      validateData(
        { ...graph, nodes: [...graph.nodes, graph.nodes[0]] },
        tourDocument,
      ),
    );
    assert.throws(() =>
      validateData(
        { ...graph, edges: [...graph.edges, graph.edges[0]] },
        tourDocument,
      ),
    );
  });
  it("rejects dangling structured node references", () => {
    assert.throws(() =>
      validateData(
        {
          ...graph,
          nodes: graph.nodes.map((node) =>
            node.id === "T_AI_TRUST"
              ? { ...node, references: [{ nodeId: "missing" }] }
              : node,
          ),
        },
        tourDocument,
      ),
    );
  });
  it("rejects invalid fields without relying on unrelated missing edges", () => {
    for (const invalid of [
      { type: "unknown" },
      { confidence: 2 },
      { confidence: -1 },
      { source: { url: "javascript:alert(1)" } },
      { source: { date: "2026-02-31" } },
      { source: { date: "2026-13-01" } },
      { source: { date: "yesterday" } },
    ]) {
      assert.throws(() =>
        validateData(
          { nodes: [{ ...graph.nodes[0], ...invalid }], edges: [] },
          [],
        ),
      );
    }
  });
  it("rejects invalid edge types and strengths", () => {
    for (const invalid of [
      { type: "unknown" },
      { strength: 1.1 },
      { strength: -1 },
    ])
      assert.throws(() =>
        validateData(
          { ...graph, edges: [{ ...graph.edges[0], ...invalid }] },
          [],
        ),
      );
  });
  it("rejects missing tour nodes, duplicate tour IDs and empty tours in both formats", () => {
    const tour = tourDocument.tours[0];
    for (const routes of [
      [{ ...tour, steps: [{ nodeId: "missing", title: "Test", text: "" }] }],
      [tour, tour],
      [{ ...tour, steps: [] }],
    ]) {
      assert.throws(() => validateData(graph, routes));
      assert.throws(() => validateData(graph, { tours: routes }));
    }
  });
  it("rejects a broken follow-up route while supporting forward references", () => {
    assert.equal(
      validateData(graph, tourDocument).tours[0].nextTourId,
      "from-trends-to-options",
    );
    assert.throws(
      () =>
        validateData(graph, {
          ...tourDocument,
          tours: tourDocument.tours.map((tour, index) =>
            index === 0 ? { ...tour, nextTourId: "missing" } : tour,
          ),
        }),
      /vervolgroute missing bestaat niet/,
    );
  });
  it("retains every ID and endpoint in the rendered graph with finite positions", () => {
    const { data } = validateData(graph, tourDocument);
    const built = buildGraph(data);
    assert.equal(built.order, 152);
    assert.equal(built.size, 346);
    assert.deepEqual(
      new Set(built.nodes()),
      new Set(graph.nodes.map((n) => n.id)),
    );
    for (const edge of graph.edges)
      assert.deepEqual(built.extremities(edge.id), [edge.source, edge.target]);
    built.forEachNode((id, attrs) => {
      assert.ok(Number.isFinite(attrs.x));
      assert.ok(Number.isFinite(attrs.y));
      assert.equal(attrs.size, attrs.baseSize);
      assert.equal(attrs.label, graph.nodes.find((n) => n.id === id)?.title);
      const sourceNode = graph.nodes.find((n) => n.id === id);
      const priorities = new Set(
        graph.meta.graphPresentation.presets.core.labelPriorityStatuses,
      );
      assert.equal(
        attrs.priority,
        sourceNode?.type === "reflection" ||
          sourceNode?.type === "scenario" ||
          (!!sourceNode?.status && priorities.has(sourceNode.status)),
      );
    });
  });
  it("keeps permanent sizes immutable throughout route five", () => {
    const { data, tours } = validateData(graph, tourDocument);
    const built = buildGraph(data);
    const before = new Map(
      built.nodes().map((id) => [id, built.getNodeAttribute(id, "size")]),
    );
    const route = tours.find((tour) => tour.id === "signal-to-opportunity");
    assert.ok(route);
    for (const step of route.steps) {
      built.forEachNode((id, attrs) => {
        const rendered = displayNodeSize(attrs.baseSize, id === step.nodeId);
        assert.equal(
          rendered,
          attrs.baseSize * (id === step.nodeId ? 1.22 : 1),
        );
      });
    }
    built.forEachNode((id, attrs) => assert.equal(attrs.size, before.get(id)));
  });
  it("preserves parallel relationships and allows empty or isolated datasets", () => {
    assert.equal(
      buildGraph(
        validateData(
          {
            ...graph,
            edges: [...graph.edges, { ...graph.edges[0], id: "parallel" }],
          },
          [],
        ).data,
      ).size,
      347,
    );
    assert.equal(
      buildGraph(validateData({ nodes: [], edges: [] }, []).data).order,
      0,
    );
    assert.equal(
      buildGraph(validateData({ nodes: [graph.nodes[0]], edges: [] }, []).data)
        .order,
      1,
    );
  });
});

describe("guided tour progress", () => {
  const tours = validateData(graph, tourDocument).tours;
  const mainStory = tours.find((tour) => tour.id === "main-story")!;
  const opportunities = tours.find(
    (tour) => tour.id === "from-trends-to-options",
  )!;

  it("keeps the current step when a visitor temporarily opens another node", () => {
    const atStepSeven = progressAtStep({}, mainStory, 6);
    const temporaryNodeSelection = mainStory.steps[2].nodeId;

    assert.ok(temporaryNodeSelection);
    assert.equal(atStepSeven[mainStory.id].currentStep, 6);
    assert.equal(atStepSeven[mainStory.id].completed, false);
  });

  it("restores a started tour from local storage", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    const progress = progressAtStep({}, mainStory, 6);

    writeTourProgress(progress, storage);
    assert.deepEqual(readTourProgress(tours, storage), progress);
    assert.equal(
      tourActionLabel(readTourProgress(tours, storage)[mainStory.id]),
      "Hervat tour",
    );
  });

  it("marks only an explicitly finished tour as completed", () => {
    const inProgress = progressAtStep(
      {},
      mainStory,
      mainStory.steps.length - 1,
    );
    assert.equal(inProgress[mainStory.id].completed, false);

    const completed = completeTour(inProgress, mainStory);
    assert.equal(completed[mainStory.id].completed, true);
    assert.equal(
      completed[mainStory.id].currentStep,
      mainStory.steps.length - 1,
    );
    assert.equal(tourActionLabel(completed[mainStory.id]), "Bekijk opnieuw");
  });

  it("completes the current route before a nextTour route starts", () => {
    const beforeHandoff = progressAtStep(
      {},
      mainStory,
      mainStory.steps.length - 1,
    );
    const afterHandoff = progressAtStep(
      completeTour(beforeHandoff, mainStory),
      opportunities,
      0,
    );

    assert.equal(afterHandoff[mainStory.id].completed, true);
    assert.equal(afterHandoff[opportunities.id].completed, false);
    assert.equal(afterHandoff[opportunities.id].currentStep, 0);
  });

  it("ignores corrupt local storage progress", () => {
    const storage = {
      getItem: (key: string) =>
        key === TOUR_PROGRESS_STORAGE_KEY ? "{not valid json" : null,
      setItem: () => undefined,
    };

    assert.deepEqual(readTourProgress(tours, storage), {});
  });
});
