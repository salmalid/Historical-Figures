import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Download, Send, Menu, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Figures ----------
type Figure = {
  id: string;
  name: string;
  era: string;
  lifespan: string;
  tagline: string;
  bio: string;
  starter: string;
  glyph: string; // single-character or short symbol used as avatar
  voice: string[]; // mock reply fragments in their cadence
};

const FIGURES: Figure[] = [
  {
    id: "ibn-khaldun",
    name: "Ibn Khaldun",
    era: "14th c. — Historian & Sociologist",
    lifespan: "1332 – 1406",
    tagline: "Father of historiography and the science of civilization.",
    bio: "I am a Tunisian-born scholar of the Maghreb. In my Muqaddimah I sought the hidden laws by which dynasties rise on the strength of 'asabiyyah — group feeling — and dissolve in the softness of luxury.",
    starter: "What causes civilizations to fall?",
    glyph: "ابن",
    voice: [
      "Consider that every dynasty bears within it the seed of its own decay.",
      "When men of the desert conquer the city, their solidarity is iron; when their grandchildren taste luxury, the iron rusts.",
      "History, rightly read, is philosophy taught by example.",
    ],
  },
  {
    id: "socrates",
    name: "Socrates",
    era: "5th c. BCE — Philosopher",
    lifespan: "c. 470 – 399 BCE",
    tagline: "The gadfly of Athens who knew only that he knew nothing.",
    bio: "I am an Athenian who spent his days in the agora, questioning generals and shoemakers alike. I wrote nothing; my thought lives only through those who suffered my questions.",
    starter: "What is the good life?",
    glyph: "Σ",
    voice: [
      "Tell me, friend — before we answer, should we not first agree on what the question truly means?",
      "The unexamined life, as I have often said, is not worth living.",
      "I know only that I know nothing, and from that small clearing all wisdom may begin.",
    ],
  },
  {
    id: "cleopatra",
    name: "Cleopatra VII",
    era: "1st c. BCE — Pharaoh of Egypt",
    lifespan: "69 – 30 BCE",
    tagline: "Last ruler of Ptolemaic Egypt; linguist, strategist, queen.",
    bio: "I am the daughter of the Nile and heir to Alexander's general. I spoke nine tongues, courted Caesar and Antony, and chose the asp over Roman triumph.",
    starter: "How does a queen survive among empires?",
    glyph: "𓁹",
    voice: [
      "A throne is not held by blood alone — it is held by the tongue, the treasury, and the temple.",
      "I learned early that Rome respects only what it cannot easily devour.",
      "Egypt was older than Caesar's grandfather's grandfather. I made certain he remembered.",
    ],
  },
  {
    id: "leonardo",
    name: "Leonardo da Vinci",
    era: "Renaissance — Polymath",
    lifespan: "1452 – 1519",
    tagline: "Painter, anatomist, engineer; student of all that moves.",
    bio: "I was born in Vinci, apprenticed in Florence, and gave my service to Milan and to France. I painted little and finished less, for the world is wider than any single canvas.",
    starter: "How do you see the world?",
    glyph: "✦",
    voice: [
      "Observe the bird, and you will understand the wing; observe the wing, and you will understand the machine.",
      "Simplicity is the ultimate sophistication — I have written this in my notebooks more than once.",
      "Learning never exhausts the mind. It is the body that grows weary first.",
    ],
  },
  {
    id: "napoleon",
    name: "Napoleon Bonaparte",
    era: "19th c. — Emperor",
    lifespan: "1769 – 1821",
    tagline: "Corsican artillerist who crowned himself Emperor of the French.",
    bio: "I was born in Ajaccio, schooled in Brienne, and lifted by the Revolution to a throne of my own design. Europe was my map; St. Helena, my final exile.",
    starter: "What makes a great general?",
    glyph: "N",
    voice: [
      "A leader is a dealer in hope. Without it, the column will not march.",
      "In war, morale is to the physical as three is to one.",
      "I have made many mistakes — Russia chief among them — but no man has ruled without them.",
    ],
  },
  {
    id: "marcus-aurelius",
    name: "Marcus Aurelius",
    era: "2nd c. CE — Philosopher-Emperor",
    lifespan: "121 – 180 CE",
    tagline: "Stoic on the Danube; emperor of Rome at her zenith.",
    bio: "I wrote my Meditations to no audience but myself, by lamplight in army camps. I ruled because duty required it, not because I desired it.",
    starter: "How should I face this day?",
    glyph: "M",
    voice: [
      "Begin the morning by reminding yourself: today I shall meet the meddler, the ungrateful, the arrogant. They cannot harm what is mine.",
      "You have power over your mind — not outside events. Realize this, and you will find strength.",
      "Waste no more time arguing what a good man should be. Be one.",
    ],
  },
  {
    id: "rumi",
    name: "Jalāl ad-Dīn Rūmī",
    era: "13th c. — Poet & Mystic",
    lifespan: "1207 – 1273",
    tagline: "Sufi master of Konya; singer of the soul's longing.",
    bio: "I was a jurist until Shams of Tabriz set my heart on fire. After his disappearance, I became only a flute, hollowed by absence, sounding the breath of the Beloved.",
    starter: "How do I find what I am searching for?",
    glyph: "ﷲ",
    voice: [
      "What you seek is seeking you. Sit still, and the door will know your knock.",
      "The wound is the place where the Light enters you.",
      "Do not be satisfied with the stories that come before you. Unfold your own myth.",
    ],
  },
  {
    id: "tesla",
    name: "Nikola Tesla",
    era: "19th–20th c. — Inventor",
    lifespan: "1856 – 1943",
    tagline: "Serbian-American visionary of alternating currents and wireless light.",
    bio: "I came from a village in Smiljan with the hum of waterwheels in my ear. I gave the world alternating current and asked, in return, only to be left alone with my coils and my pigeons.",
    starter: "What is the future of energy?",
    glyph: "⚡",
    voice: [
      "If you wish to understand the universe, think in terms of energy, frequency, and vibration.",
      "The present is theirs; the future, for which I really worked, is mine.",
      "Be alone — that is the secret of invention. Be alone, and ideas are born.",
    ],
  },
  {
    id: "douglass",
    name: "Frederick Douglass",
    era: "19th c. — Abolitionist & Orator",
    lifespan: "1818 – 1895",
    tagline: "Self-liberated, self-taught; the conscience of a republic.",
    bio: "I was born a slave in Talbot County, Maryland. I stole my own literacy, then my own freedom, and spent the rest of my life pressing America toward the meaning of her own founding words.",
    starter: "What does freedom truly require?",
    glyph: "F",
    voice: [
      "Power concedes nothing without a demand. It never did, and it never will.",
      "Once you learn to read, you will be forever free — that, I discovered as a boy, and I have lived its proof.",
      "It is easier to build strong children than to repair broken men.",
    ],
  },
  {
    id: "mary",
    name: "Maryam (Mary)",
    era: "1st c. — Spiritual Figure",
    lifespan: "c. 18 BCE – c. 40 CE (traditional)",
    tagline: "Mother of Jesus; revered in Christianity and Islam alike.",
    bio: "I am a young woman of Nazareth who was greeted by an angel and answered yes. My life was small in the eyes of the world and immense in its quietness.",
    starter: "How does one carry the weight of a calling?",
    glyph: "✣",
    voice: [
      "Be it unto me according to thy word — I learned to say this before I understood what it would cost.",
      "There is a strength that comes from being asked, not from being chosen.",
      "I kept these things, and pondered them in my heart. Sometimes that is all one can do.",
    ],
  },
];

// ---------- Mock + real send hook ----------
type Msg = { role: "user" | "figure"; text: string; ts: number };

/**
 * sendMessage — wire this to your Python backend at http://localhost:7860.
 * Replace the mock implementation with a real fetch when you connect the API.
 *
 * Example:
 *   const res = await fetch("http://localhost:7860/chat", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ figure: figure.id, message: userInput, history }),
 *   });
 *   const data = await res.json();
 *   return data.reply as string;
 */
const API_URL = "http://localhost:7860";

export async function sendMessage(
  figure: Figure,
  userInput: string,
  history: Msg[],
): Promise<string> {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ figure: figure.name, message: userInput, history }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return data.reply as string;
}

// ---------- Components ----------
function FigureAvatar({ figure, size = 40 }: { figure: Figure; size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full font-serif"
      style={{
        width: size,
        height: size,
        background:
          "linear-gradient(135deg, oklch(0.32 0.05 80), oklch(0.22 0.03 270))",
        border: "1px solid oklch(from var(--gold) l c h / 0.45)",
        color: "var(--gold)",
        fontSize: size * 0.42,
        boxShadow: "inset 0 0 12px oklch(0 0 0 / 0.4)",
      }}
      aria-hidden
    >
      {figure.glyph}
    </div>
  );
}

function FigureCard({
  figure,
  selected,
  onSelect,
}: {
  figure: Figure;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group w-full rounded-xl border p-3 text-left transition-all duration-300",
        "hover:border-[oklch(from_var(--gold)_l_c_h/0.6)] hover:bg-[oklch(0.22_0.03_270)]",
        selected
          ? "border-[var(--gold)] bg-[oklch(0.24_0.04_270)] shadow-[0_0_0_1px_oklch(from_var(--gold)_l_c_h/0.4),0_8px_24px_-12px_oklch(from_var(--gold)_l_c_h/0.5)]"
          : "border-[oklch(0.30_0.03_270)] bg-[oklch(0.18_0.025_270)]",
      )}
    >
      <div className="flex items-start gap-3">
        <FigureAvatar figure={figure} />
        <div className="min-w-0 flex-1">
          <div className="font-serif text-base leading-tight text-foreground">
            {figure.name}
          </div>
          <div className="mt-0.5 text-[11px] uppercase tracking-wider text-[var(--gold)]/80">
            {figure.era}
          </div>
          <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {figure.tagline}
          </div>
        </div>
      </div>
    </button>
  );
}

function FigureList({
  figures,
  selectedId,
  onSelect,
}: {
  figures: Figure[];
  selectedId: string | null;
  onSelect: (f: Figure) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {figures.map((f) => (
        <FigureCard
          key={f.id}
          figure={f}
          selected={selectedId === f.id}
          onSelect={() => onSelect(f)}
        />
      ))}
    </div>
  );
}

function Sidebar({
  selected,
  onSelect,
  onBegin,
  onReset,
  hasChat,
}: {
  selected: Figure | null;
  onSelect: (f: Figure) => void;
  onBegin: () => void;
  onReset: () => void;
  hasChat: boolean;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-2 px-1">
        <div className="grid h-9 w-9 place-items-center rounded-md border border-[var(--gold)]/40 bg-[oklch(0.20_0.03_270)] text-[var(--gold)]">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <div className="font-serif text-xl leading-none tracking-wide">
            Historical <span className="gold-text">Minds</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Converse with the dead
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Choose a mind
        </div>
        <FigureList
          figures={FIGURES}
          selectedId={selected?.id ?? null}
          onSelect={onSelect}
        />
      </div>

      {selected && (
        <div className="animate-fade-up rounded-xl border border-[var(--gold)]/30 bg-[oklch(0.20_0.03_270)] p-4">
          <div className="font-serif text-lg leading-tight">{selected.name}</div>
          <div className="text-[11px] uppercase tracking-wider text-[var(--gold)]/80">
            {selected.lifespan} · {selected.era}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {selected.bio}
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              onClick={onBegin}
              className="flex-1 bg-[var(--gold)] font-medium text-[var(--primary-foreground)] hover:bg-[var(--gold-soft)]"
            >
              {hasChat ? "Continue" : "Begin Conversation"}
            </Button>
            <Button
              variant="outline"
              onClick={onReset}
              className="border-[var(--gold)]/30 bg-transparent text-foreground hover:bg-[oklch(0.24_0.04_270)]"
              title="New conversation"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function TypingDots() {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1">
      <span className="typing-dot h-2 w-2 rounded-full bg-[var(--gold)]" style={{ animationDelay: "0s" }} />
      <span className="typing-dot h-2 w-2 rounded-full bg-[var(--gold)]" style={{ animationDelay: "0.2s" }} />
      <span className="typing-dot h-2 w-2 rounded-full bg-[var(--gold)]" style={{ animationDelay: "0.4s" }} />
    </div>
  );
}

function MessageBubble({ msg, figure }: { msg: Msg; figure: Figure | null }) {
  if (msg.role === "user") {
    return (
      <div className="animate-fade-up flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm border border-[oklch(0.35_0.03_270)] bg-[oklch(0.28_0.03_270)] px-4 py-2.5 text-sm leading-relaxed text-foreground">
          {msg.text}
        </div>
      </div>
    );
  }
  return (
    <div className="animate-fade-up flex flex-col items-start gap-1">
      {figure && (
        <div className="ml-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]/80">
          {figure.name}
        </div>
      )}
      <div
        className="max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 font-serif text-[15px] leading-relaxed"
        style={{
          background: "linear-gradient(180deg, var(--parchment), oklch(0.86 0.05 85))",
          color: "var(--parchment-foreground)",
          boxShadow:
            "0 1px 0 oklch(1 0 0 / 0.1) inset, 0 8px 24px -16px oklch(0 0 0 / 0.6)",
        }}
      >
        {msg.text}
      </div>
    </div>
  );
}

function ChatPanel({
  figure,
  messages,
  pending,
  onSend,
  onExport,
}: {
  figure: Figure | null;
  messages: Msg[];
  pending: boolean;
  onSend: (text: string) => void;
  onExport: () => void;
}) {
  const [input, setInput] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, pending]);

  function submit() {
    const t = input.trim();
    if (!t || !figure || pending) return;
    onSend(t);
    setInput("");
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[oklch(0.30_0.03_270)] bg-[oklch(0.18_0.025_270)]/70 px-4 py-3 backdrop-blur">
        <div className="flex min-w-0 items-center gap-3">
          {figure ? (
            <>
              <FigureAvatar figure={figure} size={36} />
              <div className="min-w-0">
                <div className="truncate font-serif text-lg leading-tight">
                  {figure.name}
                </div>
                <div className="truncate text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]/80">
                  {figure.era}
                </div>
              </div>
            </>
          ) : (
            <div className="font-serif text-lg text-muted-foreground">
              Select a mind to begin
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={messages.length === 0}
          className="border-[var(--gold)]/30 bg-transparent hover:bg-[oklch(0.24_0.04_270)]"
        >
          <Download className="mr-1.5 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Messages */}
      <div
        ref={scrollerRef}
        className="relative flex-1 overflow-y-auto px-4 py-6"
      >
        {!figure && (
          <div className="grid h-full place-items-center text-center">
            <div className="max-w-md">
              <div className="font-serif text-3xl leading-tight">
                Speak with those who shaped the world.
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Choose a figure from the left to begin a conversation. Each replies in their own voice, philosophy, and era.
              </p>
            </div>
          </div>
        )}

        {figure && messages.length === 0 && (
          <div className="grid h-full place-items-center text-center">
            <div className="max-w-md animate-fade-up">
              <FigureAvatar figure={figure} size={72} />
              <div className="mt-4 font-serif text-2xl">{figure.name}</div>
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]/80">
                {figure.lifespan}
              </div>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {figure.bio}
              </p>
            </div>
          </div>
        )}

        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.map((m, i) => (
            <MessageBubble key={i} msg={m} figure={figure} />
          ))}
          {pending && figure && (
            <div className="animate-fade-up flex flex-col items-start gap-1">
              <div className="ml-1 text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]/80">
                {figure.name}
              </div>
              <div
                className="rounded-2xl rounded-tl-sm px-2 py-2"
                style={{
                  background: "linear-gradient(180deg, var(--parchment), oklch(0.86 0.05 85))",
                }}
              >
                <TypingDots />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-[oklch(0.30_0.03_270)] bg-[oklch(0.18_0.025_270)]/70 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col gap-2">
          <div className="flex items-end gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder={figure ? "Ask your question…" : "Select a figure to begin…"}
              disabled={!figure || pending}
              className="h-11 border-[oklch(0.32_0.03_270)] bg-[oklch(0.14_0.02_270)] text-foreground placeholder:text-muted-foreground focus-visible:ring-[var(--gold)]/50"
            />
            <Button
              onClick={submit}
              disabled={!figure || pending || !input.trim()}
              className="h-11 bg-[var(--gold)] px-4 font-medium text-[var(--primary-foreground)] hover:bg-[var(--gold-soft)]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {figure && messages.length === 0 && (
            <button
              type="button"
              onClick={() => setInput(figure.starter)}
              className="self-start text-xs italic text-muted-foreground hover:text-[var(--gold)]"
            >
              Try asking: <span className="not-italic">"{figure.starter}"</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Root ----------
export function HistoricalMinds() {
  const [selected, setSelected] = useState<Figure | null>(null);
  const [chats, setChats] = useState<Record<string, Msg[]>>({});
  const [pending, setPending] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const messages = useMemo(
    () => (selected ? chats[selected.id] ?? [] : []),
    [selected, chats],
  );

  function pickFigure(f: Figure) {
    if (selected && selected.id !== f.id) {
      setClearing(true);
      setTimeout(() => {
        setSelected(f);
        setClearing(false);
      }, 220);
    } else {
      setSelected(f);
    }
    setMobileOpen(false);
  }

  function resetCurrent() {
    if (!selected) return;
    setChats((c) => ({ ...c, [selected.id]: [] }));
  }

  async function handleSend(text: string) {
    if (!selected) return;
    const userMsg: Msg = { role: "user", text, ts: Date.now() };
    const history = [...(chats[selected.id] ?? []), userMsg];
    setChats((c) => ({ ...c, [selected.id]: history }));
    setPending(true);
    try {
      const reply = await sendMessage(selected, text, history);
      // Typewriter streaming
      const placeholder: Msg = { role: "figure", text: "", ts: Date.now() };
      setChats((c) => ({ ...c, [selected.id]: [...history, placeholder] }));
      const words = reply.split(/(\s+)/);
      for (let i = 0; i < words.length; i++) {
        await new Promise((r) => setTimeout(r, 22));
        const partial = words.slice(0, i + 1).join("");
        setChats((c) => ({
          ...c,
          [selected.id]: [...history, { ...placeholder, text: partial }],
        }));
      }
    } finally {
      setPending(false);
    }
  }

  function handleExport() {
    if (!selected) return;
    const lines = [
      `Historical Minds — Conversation with ${selected.name}`,
      `${selected.lifespan} · ${selected.era}`,
      `Exported ${new Date().toLocaleString()}`,
      "".padEnd(60, "-"),
      "",
      ...messages.map((m) =>
        m.role === "user" ? `You: ${m.text}` : `${selected.name}: ${m.text}`,
      ),
    ];
    const blob = new Blob([lines.join("\n\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversation-${selected.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="vignette relative flex h-screen w-full flex-col text-foreground md:flex-row">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between gap-3 border-b border-[oklch(0.30_0.03_270)] bg-[oklch(0.16_0.025_270)]/80 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md border border-[var(--gold)]/40 text-[var(--gold)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="font-serif text-lg">
            Historical <span className="gold-text">Minds</span>
          </div>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="border-[var(--gold)]/30 bg-transparent">
              <Menu className="mr-1.5 h-4 w-4" />
              {selected ? selected.name.split(" ")[0] : "Choose"}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[85vw] max-w-sm border-[oklch(0.30_0.03_270)] bg-[oklch(0.16_0.025_270)] p-4 text-foreground"
          >
            <SheetHeader>
              <SheetTitle className="sr-only">Choose a figure</SheetTitle>
            </SheetHeader>
            <Sidebar
              selected={selected}
              onSelect={pickFigure}
              onBegin={() => setMobileOpen(false)}
              onReset={resetCurrent}
              hasChat={messages.length > 0}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="relative z-10 hidden h-full w-[320px] shrink-0 border-r border-[oklch(0.30_0.03_270)] bg-[oklch(0.16_0.025_270)]/80 p-4 backdrop-blur md:block">
        <Sidebar
          selected={selected}
          onSelect={pickFigure}
          onBegin={() => {}}
          onReset={resetCurrent}
          hasChat={messages.length > 0}
        />
      </aside>

      {/* Main */}
      <main className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div
          className={cn(
            "flex h-full flex-col transition-opacity duration-200",
            clearing ? "opacity-0" : "opacity-100",
          )}
        >
          <ChatPanel
            figure={selected}
            messages={messages}
            pending={pending}
            onSend={handleSend}
            onExport={handleExport}
          />
        </div>
      </main>
    </div>
  );
}