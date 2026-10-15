import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="conteudo" className="container section">
      <p className="eyebrow">404 / PÁGINA NÃO ENCONTRADA</p>
      <h1>
        VAMOS VOLTAR
        <br />
        AO INÍCIO?
      </h1>
      <p className="mb-8">Esse endereço não está disponível.</p>
      <Button asChild>
        <Link href="/">Voltar para a Home</Link>
      </Button>
    </main>
  );
}
