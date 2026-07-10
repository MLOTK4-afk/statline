import type { Language } from "@/lib/types";

export interface GuideContent {
  title: string;
  summary: string;
  body: string[];
}

export interface Guide {
  slug: string;
  translations: Record<Language, GuideContent>;
}

export const GUIDES: Guide[] = [
  {
    slug: "ncaa-eligibility",
    translations: {
      en: {
        title: "Understanding NCAA Eligibility",
        summary:
          "What the NCAA Eligibility Center checks, and how international coursework fits into it.",
        body: [
          "To play college sports at the D1 or D2 level in the United States, international student-athletes must register with the NCAA Eligibility Center and have their academic record certified. The Center reviews the courses you've taken, your grades, and standardized test policies for your country to determine whether your coursework is equivalent to NCAA \"core course\" requirements.",
          "Because grading systems, school calendars, and curricula vary widely by country, the review process can take longer for international students than for domestic ones — start it as early as possible, ideally at the start of your final two years of secondary school.",
          "D3 and NAIA programs generally set their own academic requirements directly with each institution's admissions office rather than going through the NCAA Eligibility Center, so requirements can differ from school to school.",
          "Rules and required documentation change over time and can depend on your specific country and school system. Always confirm current requirements directly at the official NCAA Eligibility Center website before making decisions based on this guide.",
        ],
      },
      pt: {
        title: "Entendendo a Elegibilidade da NCAA",
        summary:
          "O que o NCAA Eligibility Center verifica e como o histórico escolar internacional se encaixa nisso.",
        body: [
          "Para jogar esportes universitários no nível D1 ou D2 nos Estados Unidos, atletas estudantes internacionais precisam se registrar no NCAA Eligibility Center e ter seu histórico acadêmico certificado. O Centro analisa as disciplinas cursadas, suas notas e as políticas de exames padronizados do seu país para determinar se seu currículo é equivalente às disciplinas \"core\" exigidas pela NCAA.",
          "Como os sistemas de notas, calendários escolares e currículos variam muito de país para país, o processo de análise pode demorar mais para estudantes internacionais do que para os americanos — comece o quanto antes, idealmente no início dos últimos dois anos do ensino médio.",
          "Programas D3 e NAIA geralmente definem seus próprios requisitos acadêmicos diretamente com a secretaria de admissão de cada instituição, em vez de passar pelo NCAA Eligibility Center, então os requisitos podem variar de escola para escola.",
          "As regras e a documentação exigida mudam com o tempo e podem depender do seu país e sistema escolar específicos. Sempre confirme os requisitos atuais diretamente no site oficial do NCAA Eligibility Center antes de tomar decisões com base neste guia.",
        ],
      },
      es: {
        title: "Entendiendo la Elegibilidad de la NCAA",
        summary:
          "Qué verifica el NCAA Eligibility Center y cómo encaja tu formación académica internacional.",
        body: [
          "Para jugar deportes universitarios en el nivel D1 o D2 en Estados Unidos, los atletas estudiantiles internacionales deben registrarse en el NCAA Eligibility Center y certificar su expediente académico. El Centro revisa las materias que has cursado, tus calificaciones y las políticas de exámenes estandarizados de tu país para determinar si tu formación equivale a las materias \"core\" exigidas por la NCAA.",
          "Debido a que los sistemas de calificación, calendarios escolares y planes de estudio varían mucho según el país, el proceso de revisión puede tardar más para estudiantes internacionales que para los locales — comienza lo antes posible, idealmente al inicio de tus últimos dos años de secundaria.",
          "Los programas D3 y NAIA generalmente establecen sus propios requisitos académicos directamente con la oficina de admisiones de cada institución en lugar de pasar por el NCAA Eligibility Center, por lo que los requisitos pueden variar de una escuela a otra.",
          "Las normas y la documentación requerida cambian con el tiempo y pueden depender de tu país y sistema escolar específico. Confirma siempre los requisitos vigentes directamente en el sitio web oficial del NCAA Eligibility Center antes de tomar decisiones basadas en esta guía.",
        ],
      },
      fr: {
        title: "Comprendre l'admissibilité NCAA",
        summary:
          "Ce que vérifie le NCAA Eligibility Center et comment s'y intègre un parcours scolaire international.",
        body: [
          "Pour pratiquer un sport universitaire au niveau D1 ou D2 aux États-Unis, les athlètes étudiants internationaux doivent s'inscrire auprès du NCAA Eligibility Center et faire certifier leur dossier scolaire. Le Centre examine les matières suivies, les notes obtenues et les politiques d'examens standardisés de votre pays afin de déterminer si votre parcours équivaut aux matières « core » exigées par la NCAA.",
          "Comme les systèmes de notation, les calendriers scolaires et les programmes varient beaucoup d'un pays à l'autre, le processus d'examen peut prendre plus de temps pour les étudiants internationaux que pour les étudiants américains — commencez le plus tôt possible, idéalement au début de vos deux dernières années de lycée.",
          "Les programmes D3 et NAIA fixent généralement leurs propres exigences académiques directement avec le bureau des admissions de chaque établissement plutôt que via le NCAA Eligibility Center ; les exigences peuvent donc varier d'une école à l'autre.",
          "Les règles et documents requis évoluent dans le temps et peuvent dépendre de votre pays et de votre système scolaire. Vérifiez toujours les exigences actuelles directement sur le site officiel du NCAA Eligibility Center avant de prendre des décisions à partir de ce guide.",
        ],
      },
    },
  },
  {
    slug: "f1-visa-basics",
    translations: {
      en: {
        title: "F-1 Student Visa Basics for Student-Athletes",
        summary:
          "How the F-1 visa process generally works once you commit to a U.S. school.",
        body: [
          "Most international student-athletes attend U.S. colleges on an F-1 student visa. The process typically starts after you've been accepted by a school: the school's international student office issues a Form I-20, which you use to pay the SEVIS fee and then apply for the visa at a U.S. embassy or consulate in your home country.",
          "Visa interview appointment availability varies by country and season, so it's worth applying as early as your school allows — leave a comfortable buffer before your program start date.",
          "An F-1 visa lets you study full-time in the U.S., and student-athletes are also permitted to compete for their school's team as part of their academic program. Work authorization outside of campus is limited, so plan your finances around tuition, housing, and living costs before you arrive.",
          "Visa rules, fees, and appointment processes change and vary by country — always confirm current requirements with your school's international student office and the nearest U.S. embassy or consulate.",
        ],
      },
      pt: {
        title: "Fundamentos do Visto de Estudante F-1 para Atletas",
        summary:
          "Como funciona, de forma geral, o processo do visto F-1 depois que você se compromete com uma faculdade americana.",
        body: [
          "A maioria dos atletas estudantes internacionais frequenta faculdades americanas com o visto de estudante F-1. O processo geralmente começa depois que você é aceito por uma escola: o setor de estudantes internacionais da instituição emite o Formulário I-20, que você usa para pagar a taxa SEVIS e depois solicitar o visto em uma embaixada ou consulado dos EUA no seu país.",
          "A disponibilidade de horários para entrevista de visto varia por país e época do ano, por isso vale a pena solicitar o quanto antes sua escola permitir — deixe uma margem confortável antes do início do seu programa.",
          "O visto F-1 permite que você estude em tempo integral nos EUA, e atletas estudantes também têm permissão para competir pela equipe da sua escola como parte do seu programa acadêmico. A autorização de trabalho fora do campus é limitada, então planeje suas finanças considerando mensalidade, moradia e custo de vida antes de chegar.",
          "As regras de visto, taxas e processos de agendamento mudam e variam por país — sempre confirme os requisitos atuais com o setor de estudantes internacionais da sua escola e com a embaixada ou consulado americano mais próximo.",
        ],
      },
      es: {
        title: "Fundamentos de la Visa de Estudiante F-1 para Atletas",
        summary:
          "Cómo funciona, en términos generales, el proceso de la visa F-1 una vez que te comprometes con una universidad de EE. UU.",
        body: [
          "La mayoría de los atletas estudiantiles internacionales asisten a universidades de EE. UU. con una visa de estudiante F-1. El proceso normalmente comienza después de ser aceptado por una escuela: la oficina de estudiantes internacionales de la institución emite el Formulario I-20, que usas para pagar la cuota SEVIS y luego solicitar la visa en una embajada o consulado de EE. UU. en tu país.",
          "La disponibilidad de citas para la entrevista de visa varía según el país y la temporada, así que conviene solicitarla tan pronto como tu escuela lo permita — deja un margen cómodo antes de la fecha de inicio de tu programa.",
          "Una visa F-1 te permite estudiar a tiempo completo en EE. UU., y los atletas estudiantiles también pueden competir con el equipo de su escuela como parte de su programa académico. La autorización de trabajo fuera del campus es limitada, así que planifica tus finanzas considerando matrícula, alojamiento y gastos de vida antes de llegar.",
          "Las normas de visa, las tarifas y los procesos de citas cambian y varían según el país — confirma siempre los requisitos vigentes con la oficina de estudiantes internacionales de tu escuela y con la embajada o consulado de EE. UU. más cercano.",
        ],
      },
      fr: {
        title: "Bases du visa étudiant F-1 pour les athlètes",
        summary:
          "Comment se déroule généralement la procédure de visa F-1 une fois que vous vous engagez avec une université américaine.",
        body: [
          "La plupart des athlètes étudiants internationaux fréquentent les universités américaines avec un visa étudiant F-1. La procédure commence généralement après votre admission dans un établissement : le bureau des étudiants internationaux délivre le formulaire I-20, qui vous sert à payer les frais SEVIS puis à demander le visa auprès d'une ambassade ou d'un consulat des États-Unis dans votre pays.",
          "La disponibilité des rendez-vous pour l'entretien de visa varie selon le pays et la période de l'année ; il est donc préférable de faire la demande dès que votre établissement le permet — prévoyez une marge confortable avant la date de début de votre programme.",
          "Un visa F-1 vous permet d'étudier à temps plein aux États-Unis, et les athlètes étudiants sont également autorisés à concourir pour l'équipe de leur établissement dans le cadre de leur programme académique. L'autorisation de travail en dehors du campus est limitée ; prévoyez donc votre budget pour les frais de scolarité, le logement et les frais de subsistance avant votre arrivée.",
          "Les règles de visa, les frais et les procédures de rendez-vous changent et varient selon le pays — vérifiez toujours les exigences actuelles auprès du bureau des étudiants internationaux de votre établissement et de l'ambassade ou du consulat américain le plus proche.",
        ],
      },
    },
  },
  {
    slug: "academic-requirements",
    translations: {
      en: {
        title: "Academic Requirements & GPA Conversion",
        summary:
          "How U.S. schools generally think about grades and standardized tests from other countries.",
        body: [
          "U.S. college admissions offices are used to reviewing transcripts from many different educational systems, but converting your grades into an equivalent U.S. GPA scale (typically 0.0–4.0) helps coaches and admissions staff quickly understand your academic standing.",
          "Common secondary school systems international athletes come from include the UK's GCSEs/A-Levels, Brazil's Ensino Médio and ENEM, France's Baccalauréat, Germany's Abitur, and many countries' own national leaving exams. Each converts differently, and many U.S. universities use standardized conversion tables or third-party credential evaluation services to make an official conversion.",
          "Some schools also request standardized test scores (such as the SAT or ACT) and English proficiency scores (such as TOEFL or IELTS) as part of admissions, separate from athletic recruiting. Requirements vary a lot by school and division, so check directly with each program.",
          "When in doubt, a credential evaluation service can provide an official U.S.-equivalent GPA that you can share with coaches and admissions offices alongside your original transcript.",
        ],
      },
      pt: {
        title: "Requisitos Acadêmicos e Conversão de GPA",
        summary:
          "Como as faculdades americanas costumam avaliar notas e exames padronizados de outros países.",
        body: [
          "As secretarias de admissão das faculdades americanas estão acostumadas a analisar históricos escolares de diversos sistemas educacionais, mas converter suas notas para uma escala de GPA equivalente nos EUA (geralmente de 0,0 a 4,0) ajuda técnicos e equipes de admissão a entender rapidamente seu desempenho acadêmico.",
          "Entre os sistemas de ensino médio mais comuns de onde vêm atletas internacionais estão os GCSEs/A-Levels do Reino Unido, o Ensino Médio e o ENEM do Brasil, o Baccalauréat da França, o Abitur da Alemanha, além dos exames nacionais de conclusão de muitos outros países. Cada um converte de forma diferente, e muitas universidades americanas usam tabelas de conversão padronizadas ou serviços de avaliação de credenciais para fazer uma conversão oficial.",
          "Algumas escolas também exigem pontuações em exames padronizados (como o SAT ou o ACT) e de proficiência em inglês (como TOEFL ou IELTS) como parte do processo de admissão, separado do recrutamento esportivo. Os requisitos variam bastante por escola e divisão, então confira diretamente com cada programa.",
          "Na dúvida, um serviço de avaliação de credenciais pode fornecer um GPA oficial equivalente ao dos EUA, que você pode compartilhar com técnicos e equipes de admissão junto com seu histórico escolar original.",
        ],
      },
      es: {
        title: "Requisitos Académicos y Conversión de GPA",
        summary:
          "Cómo suelen evaluar las universidades de EE. UU. las calificaciones y exámenes estandarizados de otros países.",
        body: [
          "Las oficinas de admisión de las universidades de EE. UU. están acostumbradas a revisar expedientes de muchos sistemas educativos distintos, pero convertir tus calificaciones a una escala de GPA equivalente en EE. UU. (normalmente de 0.0 a 4.0) ayuda a los entrenadores y al personal de admisiones a entender rápidamente tu desempeño académico.",
          "Entre los sistemas de educación secundaria más comunes de donde provienen los atletas internacionales están los GCSE/A-Level del Reino Unido, el Ensino Médio y el ENEM de Brasil, el Baccalauréat de Francia, el Abitur de Alemania, y los exámenes nacionales de egreso de muchos otros países. Cada uno se convierte de forma distinta, y muchas universidades de EE. UU. usan tablas de conversión estandarizadas o servicios externos de evaluación de credenciales para hacer una conversión oficial.",
          "Algunas escuelas también solicitan puntajes de exámenes estandarizados (como el SAT o el ACT) y de dominio del inglés (como el TOEFL o el IELTS) como parte del proceso de admisión, aparte del reclutamiento deportivo. Los requisitos varían mucho según la escuela y la división, así que consúltalo directamente con cada programa.",
          "Ante la duda, un servicio de evaluación de credenciales puede darte un GPA oficial equivalente al de EE. UU. que puedes compartir con los entrenadores y las oficinas de admisión junto con tu expediente original.",
        ],
      },
      fr: {
        title: "Exigences académiques et conversion du GPA",
        summary:
          "Comment les universités américaines évaluent généralement les notes et les tests standardisés d'autres pays.",
        body: [
          "Les bureaux d'admission des universités américaines ont l'habitude d'examiner des relevés de notes provenant de nombreux systèmes éducatifs différents, mais convertir vos notes vers une échelle de GPA équivalente aux États-Unis (généralement de 0,0 à 4,0) aide les entraîneurs et le personnel d'admission à comprendre rapidement votre niveau académique.",
          "Parmi les systèmes d'enseignement secondaire courants dont sont issus les athlètes internationaux figurent les GCSE/A-Levels britanniques, l'Ensino Médio et l'ENEM du Brésil, le Baccalauréat français, l'Abitur allemand, ainsi que les examens de fin d'études nationaux de nombreux autres pays. Chacun se convertit différemment, et de nombreuses universités américaines utilisent des tables de conversion standardisées ou des services d'évaluation de diplômes pour effectuer une conversion officielle.",
          "Certains établissements exigent également des résultats à des tests standardisés (comme le SAT ou l'ACT) et des scores de maîtrise de l'anglais (comme le TOEFL ou l'IELTS) dans le cadre de l'admission, indépendamment du recrutement sportif. Les exigences varient beaucoup selon l'établissement et la division ; vérifiez donc directement auprès de chaque programme.",
          "En cas de doute, un service d'évaluation de diplômes peut fournir un GPA officiel équivalent au système américain, que vous pourrez transmettre aux entraîneurs et aux bureaux d'admission avec votre relevé de notes original.",
        ],
      },
    },
  },
  {
    slug: "contacting-coaches",
    translations: {
      en: {
        title: "How to Contact U.S. College Coaches",
        summary:
          "Practical guidance for reaching out to coaches as an international recruit.",
        body: [
          "College coaches are busy and often can't watch every video sent to them, so lead with the essentials: your name, graduation year, position, key stats or times, GPA, and a highlight video link — all in the first email.",
          "Be specific about why you're reaching out to that particular program. Coaches notice when an email mentions their team, their conference, or their style of play, versus a generic message sent to every school in a division.",
          "Because of time zone differences and busy recruiting seasons, don't be discouraged by slow replies. A polite, brief follow-up a few weeks later is normal and expected — it isn't seen as pushy.",
          "Keep your contact information (email and, if possible, a WhatsApp or phone number that works internationally) up to date and easy to find on your profile, since coaches will often reach out directly if they're interested.",
        ],
      },
      pt: {
        title: "Como Entrar em Contato com Técnicos de Faculdades Americanas",
        summary:
          "Orientações práticas para abordar técnicos como recruta internacional.",
        body: [
          "Técnicos universitários são ocupados e muitas vezes não conseguem assistir a todos os vídeos que recebem, então vá direto ao ponto: seu nome, ano de formatura, posição, principais estatísticas ou tempos, GPA e um link para o vídeo de destaque — tudo já no primeiro e-mail.",
          "Seja específico sobre por que você está entrando em contato com aquele programa em particular. Técnicos percebem quando um e-mail menciona o time deles, a conferência ou o estilo de jogo, em vez de uma mensagem genérica enviada para todas as escolas de uma divisão.",
          "Por causa da diferença de fuso horário e das temporadas movimentadas de recrutamento, não se desanime com respostas demoradas. Um follow-up educado e breve algumas semanas depois é normal e esperado — não é visto como insistência.",
          "Mantenha suas informações de contato (e-mail e, se possível, um WhatsApp ou telefone que funcione internacionalmente) atualizadas e fáceis de encontrar no seu perfil, já que os técnicos costumam entrar em contato diretamente quando têm interesse.",
        ],
      },
      es: {
        title: "Cómo Contactar a Entrenadores de Universidades en EE. UU.",
        summary:
          "Orientación práctica para acercarte a entrenadores como recluta internacional.",
        body: [
          "Los entrenadores universitarios están ocupados y muchas veces no pueden ver todos los videos que reciben, así que ve directo a lo esencial: tu nombre, año de graduación, posición, estadísticas o tiempos clave, GPA y un enlace a tu video destacado — todo en el primer correo.",
          "Sé específico sobre por qué te diriges a ese programa en particular. Los entrenadores notan cuando un correo menciona su equipo, su conferencia o su estilo de juego, en lugar de un mensaje genérico enviado a todas las escuelas de una división.",
          "Debido a las diferencias de huso horario y a las temporadas de reclutamiento ocupadas, no te desanimes por respuestas lentas. Un seguimiento breve y cortés unas semanas después es normal y se espera — no se ve como insistente.",
          "Mantén tu información de contacto (correo electrónico y, si es posible, un WhatsApp o número de teléfono que funcione internacionalmente) actualizada y fácil de encontrar en tu perfil, ya que los entrenadores suelen contactarte directamente si están interesados.",
        ],
      },
      fr: {
        title: "Comment contacter les entraîneurs universitaires américains",
        summary:
          "Conseils pratiques pour approcher les entraîneurs en tant que recrue internationale.",
        body: [
          "Les entraîneurs universitaires sont occupés et ne peuvent souvent pas regarder chaque vidéo qu'on leur envoie ; allez donc à l'essentiel dès le premier e-mail : votre nom, votre année de fin d'études, votre poste, vos statistiques ou temps clés, votre GPA et un lien vers votre vidéo de présentation.",
          "Soyez précis sur la raison pour laquelle vous contactez ce programme en particulier. Les entraîneurs remarquent quand un e-mail mentionne leur équipe, leur conférence ou leur style de jeu, plutôt qu'un message générique envoyé à toutes les écoles d'une division.",
          "En raison des décalages horaires et des périodes de recrutement chargées, ne vous découragez pas si les réponses tardent. Une relance brève et polie quelques semaines plus tard est normale et attendue — ce n'est pas perçu comme insistant.",
          "Gardez vos coordonnées (e-mail et, si possible, un numéro WhatsApp ou de téléphone joignable à l'international) à jour et faciles à trouver sur votre profil, car les entraîneurs vous contacteront souvent directement s'ils sont intéressés.",
        ],
      },
    },
  },
  {
    slug: "recruiting-timeline",
    translations: {
      en: {
        title: "A Realistic Recruiting Timeline",
        summary:
          "A general sequence of steps international athletes typically follow, roughly two years out.",
        body: [
          "Roughly two years before enrolling: research target schools and divisions, begin building your English proficiency (TOEFL/IELTS), and start tracking your academic record against NCAA core course or admissions requirements.",
          "About 12–18 months out: register with the NCAA Eligibility Center if you're targeting D1/D2, start reaching out directly to coaches with your highlight film and stats, and begin standardized testing if your target schools require it.",
          "6–12 months out: narrow down your list of interested programs, have conversations with coaches about roster spots and scholarship or financial aid possibilities, and start gathering documents for the F-1 visa process once you have an offer.",
          "Final months before enrolling: finalize your commitment, receive your I-20 from the school, complete your visa application and interview, and confirm your academic eligibility is fully certified.",
          "Every athlete's path looks a little different — sport, division, and individual school requirements all shift this timeline, so treat this as a general guide rather than a fixed schedule.",
        ],
      },
      pt: {
        title: "Um Cronograma Realista de Recrutamento",
        summary:
          "Uma sequência geral de etapas que atletas internacionais costumam seguir, aproximadamente dois anos antes.",
        body: [
          "Cerca de dois anos antes de ingressar: pesquise escolas e divisões-alvo, comece a desenvolver sua proficiência em inglês (TOEFL/IELTS) e comece a acompanhar seu histórico acadêmico em relação aos requisitos de disciplinas \"core\" da NCAA ou de admissão.",
          "De 12 a 18 meses antes: registre-se no NCAA Eligibility Center se estiver mirando D1/D2, comece a contatar técnicos diretamente com seu vídeo de destaque e estatísticas, e comece os exames padronizados se as escolas-alvo exigirem.",
          "De 6 a 12 meses antes: reduza sua lista de programas de interesse, converse com técnicos sobre vagas no elenco e possibilidades de bolsa ou ajuda financeira, e comece a reunir documentos para o processo do visto F-1 assim que tiver uma proposta.",
          "Últimos meses antes de ingressar: finalize seu compromisso, receba o I-20 da escola, complete sua solicitação de visto e entrevista, e confirme que sua elegibilidade acadêmica está totalmente certificada.",
          "O caminho de cada atleta é um pouco diferente — esporte, divisão e os requisitos de cada escola alteram esse cronograma, então trate isso como um guia geral, não como uma agenda fixa.",
        ],
      },
      es: {
        title: "Un Cronograma Realista de Reclutamiento",
        summary:
          "Una secuencia general de pasos que suelen seguir los atletas internacionales, aproximadamente dos años antes.",
        body: [
          "Aproximadamente dos años antes de matricularte: investiga las escuelas y divisiones que te interesan, comienza a desarrollar tu dominio del inglés (TOEFL/IELTS) y empieza a comparar tu historial académico con los requisitos de materias \"core\" de la NCAA o de admisión.",
          "De 12 a 18 meses antes: regístrate en el NCAA Eligibility Center si buscas D1/D2, comienza a contactar directamente a los entrenadores con tu video destacado y estadísticas, y empieza los exámenes estandarizados si las escuelas que te interesan los requieren.",
          "De 6 a 12 meses antes: reduce tu lista de programas de interés, conversa con los entrenadores sobre cupos en el equipo y posibilidades de beca o ayuda financiera, y comienza a reunir documentos para el proceso de la visa F-1 en cuanto tengas una oferta.",
          "Últimos meses antes de matricularte: confirma tu compromiso, recibe tu I-20 de la escuela, completa tu solicitud de visa y la entrevista, y confirma que tu elegibilidad académica esté totalmente certificada.",
          "El camino de cada atleta es un poco distinto — el deporte, la división y los requisitos de cada escuela modifican este cronograma, así que tómalo como una guía general y no como una agenda fija.",
        ],
      },
      fr: {
        title: "Un calendrier de recrutement réaliste",
        summary:
          "Une séquence générale d'étapes que suivent généralement les athlètes internationaux, environ deux ans à l'avance.",
        body: [
          "Environ deux ans avant l'inscription : renseignez-vous sur les établissements et divisions visés, commencez à développer votre niveau d'anglais (TOEFL/IELTS) et commencez à comparer votre dossier scolaire aux exigences des matières « core » de la NCAA ou aux critères d'admission.",
          "Environ 12 à 18 mois avant : inscrivez-vous auprès du NCAA Eligibility Center si vous visez la D1/D2, commencez à contacter directement les entraîneurs avec votre vidéo de présentation et vos statistiques, et commencez les tests standardisés si les établissements visés l'exigent.",
          "6 à 12 mois avant : réduisez votre liste de programmes intéressés, échangez avec les entraîneurs sur les places disponibles dans l'effectif et les possibilités de bourse ou d'aide financière, et commencez à rassembler les documents pour la procédure de visa F-1 dès que vous avez une offre.",
          "Derniers mois avant l'inscription : finalisez votre engagement, recevez votre I-20 de l'établissement, complétez votre demande de visa et votre entretien, et confirmez que votre admissibilité académique est entièrement certifiée.",
          "Le parcours de chaque athlète est un peu différent — le sport, la division et les exigences propres à chaque établissement modifient ce calendrier ; considérez-le donc comme un guide général plutôt qu'un programme fixe.",
        ],
      },
    },
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function getGuideContent(guide: Guide, language: Language): GuideContent {
  return guide.translations[language] ?? guide.translations.en;
}
