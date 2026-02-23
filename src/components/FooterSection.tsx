const FooterSection = () => {
  return (
    <footer className="py-10 border-t border-border">
      <div className="container text-center space-y-3">
        <p className="font-heading text-sm uppercase tracking-widest text-muted-foreground">
          Projeto Shape 90D
        </p>
        <p className="text-xs text-muted-foreground max-w-lg mx-auto">
          Este produto não substitui acompanhamento profissional de educador
          físico ou nutricionista. Consulte um profissional de saúde antes de
          iniciar qualquer programa de exercícios.
        </p>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Projeto Shape 90D. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
