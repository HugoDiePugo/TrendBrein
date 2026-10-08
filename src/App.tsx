import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  FlaskConical,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Route,
  SlidersHorizontal,
  X,
} from "lucide-react";
import graphJson from "./data/graph.json";
import toursJson from "./data/tours.json";
import { validateData } from "./schemas/graphSchema";
import { nodeTypes, type GraphPreset, type NodeType } from "./types/graph";
import { NeuralMap } from "./components/NeuralMap/NeuralMap";
import { Filters } from "./components/Filters/Filters";
import { Search } from "./components/Search/Search";
import { NodeDetail } from "./components/NodeDetail/NodeDetail";
import { TourDetailDialog } from "./components/NodeDetail/TourDetailDialog";
import { GuidedTour } from "./components/GuidedTour/GuidedTour";
import { TourChooser } from "./components/GuidedTour/TourChooser";
import { Intro } from "./components/Intro/Intro";
import {
  completeTour,
  progressAtStep,
  readTourProgress,
  writeTourProgress,
  type TourProgress,
} from "./tours/tourProgress";

function load() {
  try {
    return { ok: true as const, ...validateData(graphJson, toursJson) };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
const loaded = load();
export default function App() {
  const entryExperience = loaded.ok
    ? (loaded.data.meta?.entryExperience as
        | {
            title?: string;
            recommendedTourId?: string;
            primaryAction?: { label?: string; description?: string };
            secondaryAction?: { label?: string; description?: string };
          }
        | undefined)
    : undefined;
  const graphPresentation = loaded.ok
    ? (loaded.data.meta?.graphPresentation as
        | {
            defaultPreset?: GraphPreset;
            presets?: Record<
              GraphPreset,
              { label?: string; description?: string }
            >;
          }
        | undefined)
    : undefined;
  const [intro, setIntro] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(new Set<NodeType>(nodeTypes));
  const [focusVersion, setFocusVersion] = useState(0);
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [tourIndex, setTourIndex] = useState<number | null>(null);
  const [tourIntro, setTourIntro] = useState(false);
  const [tourChooser, setTourChooser] = useState(false);
  const [mobileTourDetail, setMobileTourDetail] = useState(false);
  const [routeId, setRouteId] = useState(
    loaded.ok
      ? (entryExperience?.recommendedTourId ?? loaded.tours[0]?.id ?? "")
      : "",
  );
  const [graphPreset, setGraphPreset] = useState<GraphPreset>(
    graphPresentation?.defaultPreset ?? "core",
  );
  const [mobileFilters, setMobileFilters] = useState(false);
  const [researchMode, setResearchMode] = useState(false);
  const [legendCollapsed, setLegendCollapsed] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tourProgress, setTourProgress] = useState<TourProgress>(() =>
    loaded.ok ? readTourProgress(loaded.tours) : {},
  );
  useEffect(() => {
    writeTourProgress(tourProgress);
  }, [tourProgress]);
  const select = useCallback((id: string | null) => {
    setSelected(id);
    setFocusVersion((v) => v + 1);
    if (id && loaded.ok) {
      const node = loaded.data.nodes.find((n) => n.id === id);
      if (node) setEnabled((prev) => new Set([...prev, node.type]));
      setMobileFilters(false);
    }
  }, []);
  if (!loaded.ok)
    return (
      <main className="data-error">
        <h1>De dataset is ongeldig</h1>
        <p>
          Corrigeer de volgende fouten in graph.json of tours.json en laad
          opnieuw.
        </p>
        <pre>{loaded.error}</pre>
      </main>
    );
  const { data, tours } = loaded;
  const dataVersion =
    typeof data.meta?.version === "string" ? data.meta.version : "onbekend";
  const tour = tours.find((t) => t.id === routeId) ?? tours[0];
  const activeTour = activeTourId
    ? tours.find((candidate) => candidate.id === activeTourId)
    : undefined;
  const recommendedTour =
    tours.find((item) => item.id === entryExperience?.recommendedTourId) ??
    tour;
  const node = data.nodes.find((n) => n.id === selected);
  const visible = data.nodes.filter((n) => enabled.has(n.type)).length;
  const step = (index: number) => {
    if (activeTour && index >= 0 && index < activeTour.steps.length) {
      setTourIntro(false);
      setMobileTourDetail(false);
      setTourIndex(index);
      setTourProgress((progress) =>
        progressAtStep(progress, activeTour, index),
      );
      select(activeTour.steps[index].nodeId);
    }
  };
  const startTour = (route = tour) => {
    if (route) {
      const saved = tourProgress[route.id];
      const resume = !!(saved?.started && !saved.completed);
      const nextIndex = resume ? saved.currentStep : 0;
      setRouteId(route.id);
      setActiveTourId(route.id);
      setIntro(false);
      setTourIntro(!resume && !!route.intro);
      setTourIndex(!resume && route.intro ? null : nextIndex);
      setMobileTourDetail(false);
      setLegendCollapsed(true);
      setSidebarCollapsed(true);
      setTourProgress((progress) => progressAtStep(progress, route, nextIndex));
      // Keep the first route node in view during the introduction as well.
      // Otherwise the full graph briefly reads as one dense cluster.
      select(route.steps[nextIndex].nodeId);
      setTourChooser(false);
    }
  };
  const requestTour = () => {
    if (tours.length > 1) setTourChooser(true);
    else startTour();
  };
  const freeSelect = (id: string | null) => {
    setMobileTourDetail(false);
    select(id);
  };
  const filter = (next: Set<NodeType>) => {
    setEnabled(next);
    if (node && !next.has(node.type)) {
      setSelected(null);
    }
  };
  const returnToTour = () => {
    if (activeTour && tourIndex !== null) step(tourIndex);
  };
  const finishTour = () => {
    if (!activeTour) return;
    setTourProgress((progress) => completeTour(progress, activeTour));
    setActiveTourId(null);
    setTourIndex(null);
    setTourIntro(false);
    setMobileTourDetail(false);
    setLegendCollapsed(false);
    setSidebarCollapsed(false);
    select(null);
  };
  const exitTour = () => {
    setActiveTourId(null);
    setTourIndex(null);
    setTourIntro(false);
    setMobileTourDetail(false);
    setLegendCollapsed(false);
    setSidebarCollapsed(false);
    select(null);
  };
  const startNextTour = () => {
    const next = activeTour?.nextTourId
      ? tours.find((candidate) => candidate.id === activeTour.nextTourId)
      : undefined;
    if (activeTour) {
      setTourProgress((progress) => completeTour(progress, activeTour));
    }
    if (next) startTour(next);
  };
  const closeMobileTourDetail = () => {
    setMobileTourDetail(false);
    returnToTour();
  };
  const isExploringOutsideTour = !!(
    activeTour &&
    tourIndex !== null &&
    selected !== activeTour.steps[tourIndex]?.nodeId
  );
  const tourContext =
    activeTour && tourIndex !== null
      ? {
          title: activeTour.title,
          currentStep: tourIndex,
          totalSteps: activeTour.steps.length,
          isExploring: isExploringOutsideTour,
          onReturn: returnToTour,
        }
      : undefined;
  return (
    <div className="app-shell">
      <header className="header">
        <button
          className="brand"
          aria-label="Terug naar introductie"
          onClick={() => {
            setIntro(true);
            exitTour();
          }}
        >
          <Network size={23} />
          <span>
            trend<span className="brand-light">brein</span>
            <small>ATLAS VAN MIJN DENKPROCES</small>
          </span>
        </button>
        <div className="header-right">
          {data.demo && (
            <span className="demo-badge">
              <i /> Demo-omgeving
            </span>
          )}
          <button
            className={`research-toggle ${researchMode ? "active" : ""}`}
            type="button"
            aria-pressed={researchMode}
            title={
              typeof data.meta?.presentation === "object"
                ? "Toon onderzoeksmetadata zoals status, confidence en relatietypes"
                : undefined
            }
            onClick={() => setResearchMode((active) => !active)}
          >
            <FlaskConical size={14} /> Onderzoeksmodus
          </button>
          {researchMode && <span className="version">v{dataVersion}</span>}
        </div>
      </header>
      {intro ? (
        <Intro
          demo={data.demo}
          hasTour={!!tour}
          entry={entryExperience}
          onExplore={() => setIntro(false)}
          onTour={() => startTour(recommendedTour)}
        />
      ) : (
        <>
          <div className={`workspace ${activeTourId ? "touring" : ""}`}>
            <aside
              className={`sidebar ${mobileFilters ? "mobile-open" : ""} ${
                sidebarCollapsed ? "is-collapsed" : ""
              }`}
              aria-hidden={sidebarCollapsed}
            >
              {!sidebarCollapsed && (
                <>
              <div className="sidebar-content">
                <div className="sidebar-title">
                  <span className="eyebrow">Mijn Trendbrein</span>
                  <button
                    className="mobile-only icon-button"
                    onClick={() => setMobileFilters(false)}
                    aria-label="Filters sluiten"
                  >
                    <X size={18} />
                  </button>
                </div>
                <h1>
                  Verken mijn
                  <br />
                  Trendbrein.
                </h1>
                <p className="sidebar-description">
                  Kies een node om mijn signalen, trends en verbanden te
                  bekijken.
                </p>
                <Search data={data} enabled={enabled} onSelect={freeSelect} />
                <Filters
                  data={data}
                  enabled={enabled}
                  onChange={filter}
                  collapsed={!!activeTourId && legendCollapsed}
                  onToggle={
                    activeTourId
                      ? () => setLegendCollapsed((collapsed) => !collapsed)
                      : undefined
                  }
                />
              </div>
              <div className="sidebar-footer">
                <span className="eyebrow">Liever een route volgen?</span>
                <button
                  className="tour-start"
                  disabled={!tour}
                  onClick={requestTour}
                >
                  <Route size={17} /> Volg mijn reis <ArrowUpRight size={16} />
                </button>
                <small>
                  {data.demo
                    ? "Alle nodes en relaties zijn demo-data."
                    : "Verken vrij of volg mijn route stap voor stap."}
                </small>
              </div>
                </>
              )}
            </aside>
            <main className="map-main">
              <button
                className="tour-sidebar-toggle"
                aria-label={
                  sidebarCollapsed ? "Zijbalk tonen" : "Zijbalk inklappen"
                }
                aria-expanded={!sidebarCollapsed}
                title={
                  sidebarCollapsed ? "Zijbalk tonen" : "Zijbalk inklappen"
                }
                onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen size={17} />
                ) : (
                  <PanelLeftClose size={17} />
                )}
              </button>
              <div className="map-title">
                <span className="eyebrow">
                  {tourIndex !== null || tourIntro
                    ? "Mijn route"
                    : "Vrij verkennen"}
                </span>
                <h2>De neurale kaart</h2>
                <span className="live-indicator">
                  <i />
                  {visible} gedachten zichtbaar
                </span>
              </div>
              <button
                className="mobile-filter-toggle"
                onClick={() => setMobileFilters(true)}
              >
                <SlidersHorizontal size={16} /> Zoeken & lagen
              </button>
              <div className="map-preset" aria-label="Kaartweergave">
                {(["core", "all"] as const).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={graphPreset === preset ? "active" : ""}
                    aria-pressed={graphPreset === preset}
                    title={graphPresentation?.presets?.[preset]?.description}
                    onClick={() => setGraphPreset(preset)}
                  >
                    {graphPresentation?.presets?.[preset]?.label ??
                      (preset === "core" ? "Kern" : "Alles")}
                  </button>
                ))}
              </div>
              <NeuralMap
                data={data}
                selected={selected}
                enabled={enabled}
                preset={graphPreset}
                tourActive={!!activeTourId}
                onSelect={freeSelect}
                focusVersion={focusVersion}
              />
              {graphPreset === "core" &&
                tourIndex === null &&
                !node &&
                enabled.has("opportunity") && (
                  <nav
                    className="mobile-shortlist"
                    aria-label="Voorlopige kansrichtingen"
                  >
                    {data.nodes
                      .filter((item) => item.status === "shortlisted_direction")
                      .map((item) => (
                        <button
                          key={item.id}
                          onClick={() => freeSelect(item.id)}
                        >
                          {item.title}
                          <ArrowUpRight size={14} />
                        </button>
                      ))}
                  </nav>
                )}
              {!visible && (
                <div className="empty-map">
                  <h3>
                    {data.nodes.length
                      ? "Even geen gedachten in beeld."
                      : "Deze kaart is nog leeg."}
                  </h3>
                  {data.nodes.length > 0 && (
                    <button onClick={() => setEnabled(new Set(nodeTypes))}>
                      Alle lagen tonen
                    </button>
                  )}
                </div>
              )}
              {activeTour &&
                !isExploringOutsideTour &&
                (tourIndex !== null || tourIntro) && (
                  <GuidedTour
                    tour={activeTour}
                    index={tourIndex ?? 0}
                    onStep={step}
                    onExit={exitTour}
                    onComplete={finishTour}
                    onOpenDetail={() => setMobileTourDetail(true)}
                    showIntro={tourIntro}
                    onStart={() => step(0)}
                    onNextTour={
                      activeTour.nextTourId &&
                      tours.some((item) => item.id === activeTour.nextTourId)
                        ? startNextTour
                        : undefined
                    }
                  />
                )}
              {tourContext?.isExploring && (
                <section className="tour-context" aria-label="Actieve tour">
                  <div>
                    <strong>{tourContext.title}</strong>
                    <span>
                      Stap {tourContext.currentStep + 1} van{" "}
                      {tourContext.totalSteps}
                    </span>
                  </div>
                  <button onClick={tourContext.onReturn}>
                    Terug naar tour
                  </button>
                </section>
              )}
            </main>
            {node && (
              <NodeDetail
                node={node}
                data={data}
                researchMode={researchMode}
                tourActive={!!activeTourId}
                tourContext={tourContext}
                onSelect={freeSelect}
                onClose={() => freeSelect(null)}
              />
            )}
            {node && mobileTourDetail && activeTour && tourIndex !== null && (
              <TourDetailDialog onClose={closeMobileTourDetail}>
                <NodeDetail
                  node={node}
                  data={data}
                  researchMode={researchMode}
                  tourActive
                  tourContext={tourContext}
                  onSelect={select}
                  onClose={closeMobileTourDetail}
                />
              </TourDetailDialog>
            )}
          </div>
          <footer className="statusbar">
            <span>
              <i /> {data.demo ? "DEMO-DATA" : "NEURALE KAART"}{" "}
              <span className="footer-note">
                {data.demo
                  ? "Geen onderzoeksresultaten of trendconclusies"
                  : "Mijn signalen, trends en verbanden"}
              </span>
            </span>
            <span>
              {data.nodes.length} nodes <b>·</b> {data.edges.length}{" "}
              verbindingen
            </span>
          </footer>
        </>
      )}
      {tourChooser && (
        <TourChooser
          tours={tours}
          progress={tourProgress}
          onSelect={startTour}
          onClose={() => setTourChooser(false)}
          onResetProgress={() => setTourProgress({})}
        />
      )}
    </div>
  );
}
