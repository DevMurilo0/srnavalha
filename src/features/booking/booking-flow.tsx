"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock3,
  Phone,
  Scissors,
  UserRound,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { brand } from "@/config/brand";

type ServiceId = "corte" | "barba" | "combo" | "barboterapia";
type ProfessionalId = "any" | "pro-1" | "pro-2";
type Step = "service" | "professional" | "datetime" | "details" | "review";

type DateOption = {
  key: string;
  date: Date;
  weekday: string;
  day: string;
  month: string;
  relative: string;
};

const steps: { id: Step; label: string }[] = [
  { id: "service", label: "Serviço" },
  { id: "professional", label: "Profissional" },
  { id: "datetime", label: "Data e horário" },
  { id: "details", label: "Seus dados" },
  { id: "review", label: "Revisão" },
];

const services = [
  {
    id: "corte" as const,
    name: "Corte",
    note: "Corte masculino e acabamento.",
    image: "/images/work/corte-perfil.webp",
  },
  {
    id: "barba" as const,
    name: "Barba",
    note: "Desenho, contorno e acabamento.",
    image: "/images/work/barba.webp",
  },
  {
    id: "combo" as const,
    name: "Corte + barba",
    note: "Atendimento combinado na mesma visita.",
    image: "/images/hero/corte-e-barba.webp",
  },
  {
    id: "barboterapia" as const,
    name: "Barboterapia",
    note: "Cuidado de barba e pele.",
    image: "/images/work/barboterapia.webp",
  },
];

const professionals = [
  {
    id: "any" as const,
    name: "Qualquer profissional",
    note: "Mostra o primeiro horário disponível.",
    image: "/images/team/atendimento.webp",
    position: "50% center",
  },
  {
    id: "pro-1" as const,
    name: "Profissional 01",
    note: "Nome será substituído pela equipe oficial.",
    image: "/images/team/atendimento.webp",
    position: "28% center",
  },
  {
    id: "pro-2" as const,
    name: "Profissional 02",
    note: "Nome será substituído pela equipe oficial.",
    image: "/images/team/atendimento.webp",
    position: "78% center",
  },
];

const timeSlots = [
  "08:30",
  "09:10",
  "09:50",
  "10:30",
  "11:10",
  "13:30",
  "14:10",
  "14:50",
  "15:30",
  "16:10",
  "16:50",
  "17:30",
];

const unavailableSlots = new Set(["09:50", "14:50", "16:50"]);

function createDateOptions(): DateOption[] {
  const result: DateOption[] = [];
  const base = new Date();

  for (let index = 0; index < 8; index += 1) {
    const date = new Date(base);
    date.setDate(base.getDate() + index);

    result.push({
      key: [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-"),
      date,
      weekday: new Intl.DateTimeFormat("pt-BR", {
        weekday: "short",
        timeZone: brand.timezone,
      })
        .format(date)
        .replace(".", ""),
      day: new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        timeZone: brand.timezone,
      }).format(date),
      month: new Intl.DateTimeFormat("pt-BR", {
        month: "short",
        timeZone: brand.timezone,
      })
        .format(date)
        .replace(".", ""),
      relative: index === 0 ? "Hoje" : index === 1 ? "Amanhã" : "",
    });
  }

  return result;
}

function formatFullDate(value: Date | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone: brand.timezone,
  }).format(value);
}

export function BookingFlow() {
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState<Step>("service");
  const [dates, setDates] = useState<DateOption[]>([]);
  const [service, setService] = useState<ServiceId | null>(null);
  const [professional, setProfessional] = useState<ProfessionalId | null>(null);
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(7 * 60);

  useEffect(() => {
    setDates(createDateOptions());
  }, []);

  useEffect(() => {
    if (!time || confirmed) return;
    setSecondsLeft(7 * 60);
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setTime(null);
          setStep("datetime");
          return 7 * 60;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [time, confirmed]);

  const selectedService = services.find((item) => item.id === service) ?? null;
  const selectedProfessional =
    professionals.find((item) => item.id === professional) ?? null;
  const selectedDate =
    dates.find((item) => item.key === dateKey)?.date ?? null;

  const activeIndex = steps.findIndex((item) => item.id === step);

  const canContinue = useMemo(() => {
    if (step === "service") return Boolean(service);
    if (step === "professional") return Boolean(professional);
    if (step === "datetime") return Boolean(dateKey && time);
    if (step === "details") {
      return name.trim().length >= 2 && phone.replace(/\D/g, "").length >= 10;
    }
    return true;
  }, [dateKey, name, phone, professional, service, step, time]);

  const goNext = () => {
    if (!canContinue) return;
    const next = steps[activeIndex + 1];
    if (next) {
      setStep(next.id);
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    }
  };

  const goBack = () => {
    const previous = steps[activeIndex - 1];
    if (previous) {
      setStep(previous.id);
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    }
  };

  const submitDetails = (event: FormEvent) => {
    event.preventDefault();
    goNext();
  };

  const finishDemo = () => {
    setConfirmed(true);
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };

  const reset = () => {
    setConfirmed(false);
    setStep("service");
    setService(null);
    setProfessional(null);
    setDateKey(null);
    setTime(null);
    setName("");
    setPhone("");
  };

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  if (confirmed) {
    return (
      <main id="conteudo" className="booking-flow-page">
        <div className="container booking-success">
          <div className="booking-success-icon">
            <Check size={32} />
          </div>
          <p className="eyebrow">DEMONSTRAÇÃO CONCLUÍDA</p>
          <h1>
            FLUXO
            <br />
            <span>FINALIZADO.</span>
          </h1>
          <p className="booking-success-lead">
            A interface chegou até o final. Como ainda não existe backend,
            nenhum horário foi salvo ou reservado de verdade.
          </p>
          <div className="booking-success-card">
            <span>{selectedService?.name}</span>
            <strong>{formatFullDate(selectedDate)}</strong>
            <strong>{time}</strong>
            <span>{selectedProfessional?.name}</span>
          </div>
          <div className="booking-success-actions">
            <button type="button" className="button button-primary" onClick={reset}>
              Testar novamente <ArrowRight size={18} />
            </button>
            <Link className="text-link" href="/">
              Voltar para o site
            </Link>
          </div>
        </div>
      </main>
    );
  }

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
              ESCOLHA.
              <br />
              CONFIRME.
              <br />
              <span>PRONTO.</span>
            </h1>
          </div>
          <p className="booking-flow-intro">
            Esta fase é apenas a interface. Nenhuma escolha é enviada ou salva
            fora do navegador.
          </p>
        </header>

        <nav className="booking-progress" aria-label="Etapas do agendamento">
          {steps.map((item, index) => {
            const isActive = item.id === step;
            const isDone = index < activeIndex;
            return (
              <button
                type="button"
                key={item.id}
                className={isActive ? "active" : isDone ? "done" : ""}
                onClick={() => {
                  if (index <= activeIndex) setStep(item.id);
                }}
                disabled={index > activeIndex}
              >
                <span>{isDone ? <Check size={13} /> : null}</span>
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
                initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                {step === "service" ? (
                  <div>
                    <div className="booking-step-heading">
                      <Scissors size={22} />
                      <div>
                        <p className="eyebrow">ESCOLHA O SERVIÇO</p>
                        <h2>O QUE VOCÊ VAI FAZER?</h2>
                      </div>
                    </div>

                    <div className="booking-service-grid">
                      {services.map((item) => (
                        <button
                          type="button"
                          key={item.id}
                          className={
                            service === item.id
                              ? "booking-service-card selected"
                              : "booking-service-card"
                          }
                          onClick={() => setService(item.id)}
                        >
                          <span className="booking-card-image">
                            <Image
                              src={item.image}
                              alt=""
                              fill
                              sizes="(max-width: 699px) 42vw, 220px"
                              className="object-cover"
                            />
                          </span>
                          <span className="booking-card-copy">
                            <strong>{item.name}</strong>
                            <small>{item.note}</small>
                          </span>
                          <span className="booking-select-indicator">
                            {service === item.id ? <Check size={15} /> : null}
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="booking-demo-note">
                      Serviços, preços e durações continuam provisórios até a
                      confirmação oficial da barbearia.
                    </p>
                  </div>
                ) : null}

                {step === "professional" ? (
                  <div>
                    <div className="booking-step-heading">
                      <UserRound size={22} />
                      <div>
                        <p className="eyebrow">ESCOLHA O PROFISSIONAL</p>
                        <h2>COM QUEM VOCÊ QUER CORTAR?</h2>
                      </div>
                    </div>
                    <div className="booking-professional-grid">
                      {professionals.map((item) => (
                        <button
                          type="button"
                          key={item.id}
                          className={
                            professional === item.id
                              ? "booking-professional-card selected"
                              : "booking-professional-card"
                          }
                          onClick={() => setProfessional(item.id)}
                        >
                          <span className="booking-professional-photo">
                            <Image
                              src={item.image}
                              alt=""
                              fill
                              sizes="(max-width: 699px) 100vw, 250px"
                              className="object-cover"
                              style={{ objectPosition: item.position }}
                            />
                          </span>
                          <span>
                            <strong>{item.name}</strong>
                            <small>{item.note}</small>
                          </span>
                          <span className="booking-select-indicator">
                            {professional === item.id ? <Check size={15} /> : null}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {step === "datetime" ? (
                  <div>
                    <div className="booking-step-heading">
                      <CalendarDays size={22} />
                      <div>
                        <p className="eyebrow">DATA E HORÁRIO</p>
                        <h2>QUANDO VOCÊ QUER IR?</h2>
                      </div>
                    </div>

                    <div className="booking-date-strip">
                      {dates.length ? (
                        dates.map((item) => (
                          <button
                            type="button"
                            key={item.key}
                            className={
                              dateKey === item.key
                                ? "booking-date selected"
                                : "booking-date"
                            }
                            onClick={() => {
                              setDateKey(item.key);
                              setTime(null);
                            }}
                          >
                            <small>{item.relative || item.weekday}</small>
                            <strong>{item.day}</strong>
                            <span>{item.month}</span>
                          </button>
                        ))
                      ) : (
                        <span className="booking-loading">Carregando datas…</span>
                      )}
                    </div>

                    {dateKey ? (
                      <>
                        <div className="booking-times-heading">
                          <div>
                            <p className="eyebrow">HORÁRIOS DISPONÍVEIS</p>
                            <p>Disponibilidade visual de demonstração.</p>
                          </div>
                          {time ? (
                            <span className="booking-hold">
                              <Clock3 size={15} />
                              {minutes}:{seconds}
                            </span>
                          ) : null}
                        </div>
                        <div className="booking-times">
                          {timeSlots.map((slot) => {
                            const disabled = unavailableSlots.has(slot);
                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={disabled}
                                className={
                                  time === slot
                                    ? "selected"
                                    : disabled
                                      ? "unavailable"
                                      : ""
                                }
                                onClick={() => setTime(slot)}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                        <p className="booking-demo-note">
                          O contador simula a reserva temporária de 7 minutos.
                          Sem backend, ele vale apenas nesta tela.
                        </p>
                      </>
                    ) : (
                      <div className="booking-empty-state">
                        Escolha um dia para ver os horários.
                      </div>
                    )}
                  </div>
                ) : null}

                {step === "details" ? (
                  <form onSubmit={submitDetails}>
                    <div className="booking-step-heading">
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
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          placeholder="Seu nome"
                          autoComplete="name"
                        />
                      </label>
                      <label>
                        <span>WhatsApp</span>
                        <input
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          placeholder="(81) 99999-9999"
                          inputMode="tel"
                          autoComplete="tel"
                        />
                      </label>
                    </div>
                    <div className="booking-whatsapp-preview">
                      <span className="booking-whatsapp-icon">WA</span>
                      <div>
                        <strong>Confirmação por WhatsApp</strong>
                        <p>
                          Na fase com backend, este número receberá o código de
                          verificação e a confirmação nas últimas 24 horas.
                        </p>
                      </div>
                    </div>
                    <button
                      className="booking-hidden-submit"
                      type="submit"
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                  </form>
                ) : null}

                {step === "review" ? (
                  <div>
                    <div className="booking-step-heading">
                      <Check size={22} />
                      <div>
                        <p className="eyebrow">REVISE ANTES DE CONFIRMAR</p>
                        <h2>ESTÁ TUDO CERTO?</h2>
                      </div>
                    </div>

                    <div className="booking-review">
                      <div>
                        <span>Serviço</span>
                        <strong>{selectedService?.name}</strong>
                      </div>
                      <div>
                        <span>Profissional</span>
                        <strong>{selectedProfessional?.name}</strong>
                      </div>
                      <div>
                        <span>Data</span>
                        <strong>{formatFullDate(selectedDate)}</strong>
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
                        O botão abaixo apenas mostra a tela de sucesso. Nenhum
                        registro será criado.
                      </p>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>

            <div className="booking-step-actions">
              <button
                type="button"
                className="booking-secondary-button"
                onClick={goBack}
                disabled={activeIndex === 0}
              >
                <ChevronLeft size={18} /> Voltar
              </button>

              {step === "review" ? (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={finishDemo}
                >
                  Confirmar demonstração <Check size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  className="button button-primary"
                  disabled={!canContinue}
                  onClick={goNext}
                >
                  Continuar <ArrowRight size={18} />
                </button>
              )}
            </div>
          </section>

          <aside className="booking-summary">
            <div className="booking-summary-head">
              <p className="eyebrow">SEU AGENDAMENTO</p>
              <span>Prévia</span>
            </div>
            <dl>
              <div>
                <dt>Serviço</dt>
                <dd>{selectedService?.name ?? "Escolha um serviço"}</dd>
              </div>
              <div>
                <dt>Profissional</dt>
                <dd>{selectedProfessional?.name ?? "Escolha um profissional"}</dd>
              </div>
              <div>
                <dt>Data</dt>
                <dd>{selectedDate ? formatFullDate(selectedDate) : "Escolha uma data"}</dd>
              </div>
              <div>
                <dt>Horário</dt>
                <dd>{time ?? "Escolha um horário"}</dd>
              </div>
            </dl>
            {time ? (
              <div className="booking-summary-hold">
                <Clock3 size={17} />
                <div>
                  <span>Reserva visual</span>
                  <strong>{minutes}:{seconds}</strong>
                </div>
              </div>
            ) : null}
            <p className="booking-summary-note">
              Nenhum horário está sendo bloqueado de verdade nesta fase.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
