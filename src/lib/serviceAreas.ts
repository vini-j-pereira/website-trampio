/**
 * Unified service areas — derived from categoriesData.
 * Use these in: register/page.tsx, search/page.tsx, profile/page.tsx
 */

export interface ServiceGroup {
    category: string;
    items: string[];
}

export const SERVICE_AREAS_GROUPED: ServiceGroup[] = [
    {
        category: "Assistência Técnica",
        items: [
            "Aparelho de Som", "Aquecedor a Gás", "Ar Condicionado", "Câmera",
            "DVD / Blu-Ray", "Home Theater", "Televisão", "Video Game",
            "Adega Climatizada", "Fogão e Cooktop", "Geladeira e Freezer", "Lava Louça",
            "Máquina de Costura", "Máquina de Lavar", "Microondas", "Secadora de Roupas",
            "Cabeamento e Redes", "Celular", "Computador Desktop", "Fone de Ouvido",
            "Impressora", "Notebook", "Tablet", "Telefone Fixo", "Telefonia PABX",
        ],
    },
    {
        category: "Autos",
        items: [
            "Alarme automotivo", "Ar condicionado automotivo", "Auto elétrico", "Som automotivo",
            "Funilaria", "Higienização e Polimento", "Martelinho de Ouro", "Pintura automotiva",
            "Insulfilm", "Vidraçaria Automotiva",
            "Borracharia", "Guincho", "Mecânica Geral", "Venda de Automóveis",
        ],
    },
    {
        category: "Aulas",
        items: [
            "Concursos", "Escolares e Reforço", "Educação Especial", "Ensino Superior",
            "Ensino Profissionalizante", "Idiomas", "Pré-Vestibular", "Tarefas",
            "Artes", "Artesanato", "Circo", "Fotografia", "Música", "TV e Teatro",
            "Dança", "Esportes", "Jogos", "Lazer", "Luta",
            "Desenvolvimento Web", "Informática", "Marketing Digital",
        ],
    },
    {
        category: "Consultorias",
        items: [
            "Assessoria de Imprensa", "Escrita e Conteúdo", "Pesquisa em Geral",
            "Produção de Conteúdo", "Tradutores",
            "Administração de Imóveis", "Assessor de Investimentos", "Auxílio administrativo",
            "Contador", "Corretor", "Despachante", "Digitalizar documentos",
            "Economia e Finanças", "Recrutamento e Seleção", "Segurança do trabalho",
            "Advogado", "Mediação de Conflitos", "Testamento e Planejamento Patrimonial",
            "Consultor pessoal", "Consultoria especializada", "Detetive particular", "Guia de Turismo",
        ],
    },
    {
        category: "Design e Tecnologia",
        items: [
            "Apps para smartphone", "Desenvolvimento de games", "Desenvolvimento de sites",
            "Marketing digital", "UI design",
            "Convites", "Criação de logos", "Criação de marcas", "Diagramador",
            "Materiais promocionais", "Produção gráfica", "Áudio / Visual", "Animação motion",
            "Edição de fotos", "Fotografia", "Ilustração", "Modelagem 2D e 3D",
            "Restauração de Fotos", "Web Design",
        ],
    },
    {
        category: "Eventos",
        items: [
            "Assessor de eventos", "Carros de casamento", "Celebrantes", "Equipamento para festas",
            "Garçons e copeiras", "Local para eventos", "Manobrista", "Organização de Eventos",
            "Recepcionistas", "Seguranças",
            "Bartender", "Buffet completo", "Chocolateiro", "Churrasqueiro", "Confeiteira",
            "Animação de festas", "Bandas e cantores", "DJs", "Ônibus Balada",
            "Brindes e lembrancinhas", "Decoração", "Edição de vídeos", "Florista",
        ],
    },
    {
        category: "Moda e Beleza",
        items: [
            "Bronzeamento", "Depilação", "Design de sobrancelhas", "Designer de cílios",
            "Esteticistas", "Manicure e pedicure", "Maquiadores", "Micropigmentador", "Podólogo",
            "Cabeleireiros", "Barbeiros",
            "Alfaiate", "Corte e costura", "Personal stylist", "Sapateiro", "Visagista",
            "Artesanato", "Esotérico",
        ],
    },
    {
        category: "Reformas e Reparos",
        items: [
            "Aluguel de maquinário",
            "Arquitetos", "Design de Interiores", "Empreiteiro", "Engenheiro",
            "Limpeza pós obra", "Marmoraria e Granitos", "Pedreiro", "Poço Artesiano",
            "Remoção de Entulho",
            "Antenista", "Automação residencial", "Instalação de eletrônicos",
            "Instalador tv digital", "Segurança eletrônica", "Toldos e Coberturas",
            "Encanador", "Eletricista", "Gás", "Gesso e drywall", "Pavimentação",
            "Pintor", "Serralheria e solda", "Vidraceiro",
            "Chaveiro", "Dedetizador", "Desentupidor", "Desinfecção", "Impermeabilizador",
            "Marceneiro", "Marido de Aluguel", "Mudanças e Carretos", "Tapeceiro",
            "Banheira", "Coifas e Exaustores", "Decorador", "Instalador de Papel de Parede",
            "Jardinagem", "Montador de Móveis", "Paisagista", "Piscina", "Redes de Proteção",
        ],
    },
    {
        category: "Saúde",
        items: [
            "Biomedicina Estética", "Remoção de Tatuagem",
            "Cozinheira", "Dentista", "Fisioterapeuta", "Fonoaudiólogo", "Médico",
            "Nutricionista", "Quiropraxia", "Terapias Alternativas", "Terapia Ocupacional",
            "Aconselhamento Conjugal e Familiar", "Coach", "Doula", "Psicanalista", "Psicólogo",
            "Cuidador de Pessoas", "Enfermeira",
        ],
    },
    {
        category: "Serviços Domésticos",
        items: [
            "Diarista", "Limpeza de Piscina", "Passadeira", "Lavadeira", "Personal shopper",
            "Babá", "Cozinheira doméstica", "Entregador", "Motorista",
            "Personal Organizer", "Segurança Particular",
            "Adestrador de Cães", "Passeador de Cães", "Serviços para Pets",
        ],
    },
];

/** Flat list of all service specialties for simple selects */
export const ALL_SERVICE_AREAS: string[] = SERVICE_AREAS_GROUPED.flatMap((g) => g.items);
