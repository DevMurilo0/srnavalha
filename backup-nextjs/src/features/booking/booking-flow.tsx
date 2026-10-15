"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Phone,
  UsersRound,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  getMockAvailability,
  isMockDayAvailable,
  MOCK_HOLD_SECONDS,
  mockProfessionals,
  type ProfessionalId,
} from "./booking-mocks";

type Step = "professional" | "datetime" | "details" | "review";
const steps: { id: Step; label: string }[] = [
  { id: "professional", label: "Profissional" },
  { id: "datetime", label: "Data e horário" },
  { id: "details", label: "Seus dados" },
  { id: "review", label: "Revisão" },
];
const weekdays = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" })
    .format(date)
    .toUpperCase();
}
function fullDate(date: Date | null) {
  return date
    ? new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(date)
    : "—";
}
function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
function calendarDays(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const leading = new Date(year, monthIndex, 1).getDay();
  const count = new Date(year, monthIndex + 1, 0).getDate();
  return [
    ...Array.from({ length: leading }, () => null),
    ...Array.from(
      { length: count },
      (_, index) => new Date(year, monthIndex, index + 1),
    ),
  ];
}

export function BookingFlow() {
  const reducedMotion = useReducedMotion();
  const stepHeadingRef = useRef<HTMLDivElement>(null);
  const today = useMemo(() => startOfDay(new Date()), []);
  const initialMonth = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
    [today],
  );
  const [month, setMonth] = useState(initialMonth);
  const [step, setStep] = useState<Step>("professional");
  const [professional, setProfessional] = useState<ProfessionalId | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(MOCK_HOLD_SECONDS);
  const [confirmed, setConfirmed] = useState(false);
  const selectedProfessional =
    mockProfessionals.find((item) => item.id === professional) ?? null;
  const slots =
    selectedDate && professional
      ? getMockAvailability(selectedDate, professional)
      : [];
  const activeIndex = steps.findIndex((item) => item.id === step);
  const isCurrentMonth =
    month.getFullYear() === initialMonth.getFullYear() &&
    month.getMonth() === initialMonth.getMonth();

  useEffect(() => {
    if (!time || confirmed) return;
    const interval = window.setInterval(
      () =>
        setSecondsLeft((current) => {
          if (current <= 1) {
            window.clearInterval(interval);
            setTime(null);
            return MOCK_HOLD_SECONDS;
          }
          return current - 1;
        }),
      1000,
    );
    return () => window.clearInterval(interval);
  }, [time, confirmed]);

  useEffect(() => {
    if (activeIndex === 0) return;
    const frame = window.requestAnimationFrame(() =>
      stepHeadingRef.current?.focus({ preventScroll: true }),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [activeIndex]);

  const canContinue =
    step === "professional"
      ? Boolean(professional)
      : step === "datetime"
        ? Boolean(selectedDate && time)
        : step === "details"
          ? name.trim().length >= 2 && phone.replace(/\D/g, "").length >= 10
          : true;
  const timer = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;
  function changeStep(next: Step) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }
  function goNext() {
    const next = steps[activeIndex + 1];
    if (canContinue && next) changeStep(next.id);
  }
  function submitDetails(event: FormEvent) {
    event.preventDefault();
    goNext();
  }
  function reset() {
    setConfirmed(false);
    setStep("professional");
    setProfessional(null);
    setSelectedDate(null);
    setTime(null);
    setName("");
    setPhone("");
    setMonth(initialMonth);
  }

  if (confirmed)
    return (
      <main id="conteudo" className="booking-flow-page">
        <div className="container booking-success">
          <div className="booking-success-icon">
            <Check size={32} />
          </div>
          <p className="eyebrow">DEMONSTRAÇÃO CONCLUÍDA</p>
          <h1>
            HORÁRIO
            <br />
            <span>CONFIRMADO.</span>
          </h1>
          <p className="booking-success-lead">
            O fluxo chegou ao final. Nesta demonstração frontend, nenhum horário
            ou dado pessoal foi salvo.
          </p>
          <div className="booking-success-card">
            <span>{selectedProfessional?.name}</span>
            <strong>{fullDate(selectedDate)}</strong>
            <strong>{time}</strong>
            <span>{name}</span>
          </div>
          <div className="booking-success-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={reset}
            >
              Testar novamente <ArrowRight size={18} />
            </button>
            <Link className="text-link" href="/">
              Voltar para o site
            </Link>
          </div>
        </div>
      </main>
    );

  return (
    <main id="conteudo" className="booking-flow-page">
      <div className="container booking-flow-shell">
        <header className="booking-flow-header">
          <Link className="booking-flow-back-home" href="/">
            <ArrowLeft size={17} /> Voltar
          </Link>
          <div>
            <p className="eyebrow">AGENDAMENTO</p>
            <h1>
              SEU HORÁRIO.
              <br />
              <span>SEM COMPLICAÇÃO.</span>
            </h1>
          </div>
          <p className="booking-flow-intro">
            Escolha quem vai atender, encontre um horário e informe seu
            WhatsApp. Nesta fase, tudo acontece apenas no navegador.
          </p>
        </header>
        <nav className="booking-progress" aria-label="Etapas do agendamento">
          {steps.map((item, index) => {
            const active = item.id === step;
            const done = index < activeIndex;
            return (
              <button
                type="button"
                key={item.id}
                className={active ? "active" : done ? "done" : ""}
                disabled={index > activeIndex}
                aria-current={active ? "step" : undefined}
                onClick={() => index <= activeIndex && changeStep(item.id)}
              >
                <span>{done ? <Check size={13} /> : null}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="booking-flow-layout">
          <section className="booking-step-panel">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
              >
                {step === "professional" && (
                  <div>
            <div className="booking-step-heading" ref={stepHeadingRef} tabIndex={-1}>
                      <UsersRound size={22} />
                      <div>
                        <p className="eyebrow">ESCOLHA O PROFISSIONAL</p>
                        <h2>
                          COM QUEM
                          <br />
                          VOCÊ QUER CORTAR?
                        </h2>
                      </div>
                    </div>
                    <div className="booking-professional-grid">
                      {mockProfessionals.map((item) => (
                        <motion.button
                          whileTap={
                            reducedMotion ? undefined : { scale: 0.985 }
                          }
                          type="button"
                          key={item.id}
                          className={`${professional === item.id ? "booking-professional-card selected" : "booking-professional-card"} ${item.id === "any" ? "booking-professional-any" : ""}`}
                          aria-pressed={professional === item.id}
                          onClick={() => {
                            setProfessional(item.id);
                            setSelectedDate(null);
                            setTime(null);
                          }}
                        >
                          {item.image ? (
                            <span className="booking-professional-photo">
                              <Image
                                src={item.image}
                                alt="Profissionais em atendimento na SR Navalha"
                                fill
                                sizes="(max-width: 699px) 92px, 240px"
                                className="object-cover"
                                style={{ objectPosition: item.position }}
                              />
                            </span>
                          ) : (
                            <span className="booking-any-icon">
                              <UsersRound size={31} />
                            </span>
                          )}
                          <span>
                            <strong>{item.name}</strong>
                            <small>{item.note}</small>
                          </span>
                          <span className="booking-select-indicator">
                            {professional === item.id && <Check size={15} />}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                    <p className="booking-demo-note">
                      Nomes e fotos individuais serão atualizados após a
                      confirmação oficial da equipe.
                    </p>
                  </div>
                )}
                {step === "datetime" && (
                  <div>
            <div className="booking-step-heading" ref={stepHeadingRef} tabIndex={-1}>
                      <CalendarDays size={22} />
                      <div>
                        <p className="eyebrow">DATA E HORÁRIO</p>
                        <h2>QUANDO VOCÊ QUER IR?</h2>
                      </div>
                    </div>
                    <div className="booking-calendar-layout">
                      <div className="booking-calendar">
                        <div className="booking-calendar-head">
                          <button
                            type="button"
                            aria-label="Mês anterior"
                            disabled={isCurrentMonth}
                            onClick={() =>
                              setMonth(
                                new Date(
                                  month.getFullYear(),
                                  month.getMonth() - 1,
                                  1,
                                ),
                              )
                            }
                          >
                            <ChevronLeft />
                          </button>
                          <strong aria-live="polite">
                            {monthLabel(month)}
                          </strong>
                          <button
                            type="button"
                            aria-label="Mês seguinte"
                            onClick={() =>
                              setMonth(
                                new Date(
                                  month.getFullYear(),
                                  month.getMonth() + 1,
                                  1,
                                ),
                              )
                            }
                          >
                            <ChevronRight />
                          </button>
                        </div>
                        <div className="booking-weekdays" aria-hidden="true">
                          {weekdays.map((day) => (
                            <span key={day}>{day}</span>
                          ))}
                        </div>
                        <div className="booking-month-grid">
                          {calendarDays(month).map((date, index) => {
                            if (!date) return <span key={`empty-${index}`} />;
                            const available =
                              date >= today && isMockDayAvailable(date);
                            const selected =
                              selectedDate &&
                              dateKey(date) === dateKey(selectedDate);
                            const current = dateKey(date) === dateKey(today);
                            return (
                              <button
                                type="button"
                                key={dateKey(date)}
                                disabled={!available}
                                className={`${selected ? "selected" : ""} ${current ? "today" : ""}`}
                                aria-label={`${fullDate(date)}${!available ? ", indisponível" : ""}`}
                                aria-pressed={Boolean(selected)}
                                onClick={() => {
                                  setSelectedDate(date);
                                  setTime(null);
                                }}
                              >
                                <span>{date.getDate()}</span>
                                {current && <small>Hoje</small>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="booking-time-panel">
                        <div className="booking-times-heading">
                          <div>
                            <p className="eyebrow">HORÁRIOS DISPONÍVEIS</p>
                            <p>
                              {selectedDate
                                ? fullDate(selectedDate)
                                : "Selecione um dia no calendário."}
                            </p>
                          </div>
                        </div>
                        <AnimatePresence mode="wait">
                          {selectedDate ? (
                            <motion.div
                              key={dateKey(selectedDate)}
                              initial={
                                reducedMotion ? false : { opacity: 0, x: 8 }
                              }
                              animate={{ opacity: 1, x: 0 }}
                            >
                              <div className="booking-times">
                                {slots.map((slot) => (
                                  <motion.button
                                    whileTap={
                                      reducedMotion
                                        ? undefined
                                        : { scale: 0.96 }
                                    }
                                    type="button"
                                    key={slot}
                                    className={time === slot ? "selected" : ""}
                                    aria-pressed={time === slot}
                                    onClick={() => {
                                      setSecondsLeft(MOCK_HOLD_SECONDS);
                                      setTime(slot);
                                    }}
                                  >
                                    {slot}
                                  </motion.button>
                                ))}
                              </div>
                              {time && (
                                <div className="booking-inline-hold">
                                  <span>HORÁRIO RESERVADO PARA VOCÊ</span>
                                  <strong>
                                    <Clock3 size={16} /> {timer}
                                  </strong>
                                </div>
                              )}
                              <p className="booking-demo-note">
                                Disponibilidade e reserva de 7 minutos simuladas
                                no frontend.
                              </p>
                            </motion.div>
                          ) : (
                            <div className="booking-empty-state">
                              Escolha um dia disponível para ver os horários.
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                )}
                {step === "details" && (
                  <form onSubmit={submitDetails}>
            <div className="booking-step-heading" ref={stepHeadingRef} tabIndex={-1}>
                      <Phone size={22} />
                      <div>
                        <p className="eyebrow">SEUS DADOS</p>
                        <h2>COMO A GENTE FALA COM VOCÊ?</h2>
                      </div>
                    </div>
                    <div className="booking-form-grid">
                      <label>
                        <span>Nome</span>
                        <input
                          required
                          minLength={2}
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          placeholder="Seu nome"
                          autoComplete="name"
                        />
                      </label>
                      <label>
                        <span>WhatsApp</span>
                        <input
                          required
                          value={phone}
                          onChange={(event) =>
                            setPhone(formatPhone(event.target.value))
                          }
                          placeholder="(81) 99999-9999"
                          inputMode="tel"
                          autoComplete="tel"
                        />
                      </label>
                    </div>
                    <div className="booking-whatsapp-preview">
                      <span className="booking-whatsapp-icon">WA</span>
                      <div>
                        <strong>
                          Usaremos este número para confirmar seu horário.
                        </strong>
                        <p>
                          A confirmação por WhatsApp será ativada em uma próxima
                          fase.
                        </p>
                      </div>
                    </div>
                  </form>
                )}
                {step === "review" && (
                  <div>
            <div className="booking-step-heading" ref={stepHeadingRef} tabIndex={-1}>
                      <Check size={22} />
                      <div>
                        <p className="eyebrow">REVISE ANTES DE CONFIRMAR</p>
                        <h2>SEU HORÁRIO.</h2>
                      </div>
                    </div>
                    <div className="booking-review">
                      <div>
                        <span>Profissional</span>
                        <strong>{selectedProfessional?.name}</strong>
                      </div>
                      <div>
                        <span>Data</span>
                        <strong>{fullDate(selectedDate)}</strong>
                      </div>
                      <div>
                        <span>Horário</span>
                        <strong>{time}</strong>
                      </div>
                      <div>
                        <span>Cliente</span>
                        <strong>{name}</strong>
                      </div>
                      <div>
                        <span>WhatsApp</span>
                        <strong>{phone}</strong>
                      </div>
                    </div>
                    <div className="booking-warning">
                      <strong>Demonstração frontend</strong>
                      <p>
                        Confirmar mostra apenas a conclusão do fluxo. Nenhum
                        registro será criado.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            <div className="booking-step-actions">
              <button
                type="button"
                className="booking-secondary-button"
                disabled={activeIndex === 0}
                onClick={() =>
                  activeIndex > 0 && changeStep(steps[activeIndex - 1].id)
                }
              >
                <ChevronLeft size={17} /> Voltar
              </button>
              <button
                type="button"
                className="button button-primary"
                disabled={!canContinue}
                onClick={step === "review" ? () => setConfirmed(true) : goNext}
              >
                {step === "review" ? "Confirmar" : "Continuar"}{" "}
                {step === "review" ? (
                  <Check size={18} />
                ) : (
                  <ArrowRight size={18} />
                )}
              </button>
            </div>
          </section>
          <aside className="booking-summary">
            <div className="booking-summary-head">
              <p className="eyebrow">SEU HORÁRIO</p>
              <span>Resumo</span>
            </div>
            <dl>
              <div>
                <dt>Profissional</dt>
                <dd>
                  {selectedProfessional?.name ?? "Escolha um profissional"}
                </dd>
              </div>
              <div>
                <dt>Data</dt>
                <dd>
                  {selectedDate ? fullDate(selectedDate) : "Escolha uma data"}
                </dd>
              </div>
              <div>
                <dt>Horário</dt>
                <dd>{time ?? "Escolha um horário"}</dd>
              </div>
              {name && (
                <div>
                  <dt>Nome</dt>
                  <dd>{name}</dd>
                </div>
              )}
            </dl>
            {time && (
              <div className="booking-summary-hold">
                <Clock3 size={17} />
                <div>
                  <span>Reserva simulada</span>
                  <strong>{timer}</strong>
                </div>
              </div>
            )}
            <p className="booking-summary-note">
              Nada é salvo ou enviado nesta versão.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
