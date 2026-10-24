/* Level Up English — currículo base (A1 → B1).
   Cada unidade gera duas lições: "Vocabulário" e "Frases e diálogos".
   words:     [inglês, português]
   sentences: [inglês, português]
   fills:     [frase com ___, resposta, [opções], explicação em PT] */
window.LUE_UNITS = [
  {
    id: "u01", cefr: "A1", title: "Primeiros passos", topic: "amizades",
    goal: "Cumprimentar, se apresentar e agradecer",
    words: [["hello","olá"],["goodbye","tchau"],["please","por favor"],["thank you","obrigado"],["yes","sim"],["no","não"],["name","nome"],["friend","amigo"]],
    sentences: [["Hello, my name is Ana.","Olá, meu nome é Ana."],["Nice to meet you.","Prazer em te conhecer."],["How are you?","Como você está?"],["I am fine, thank you.","Estou bem, obrigado."],["Where are you from?","De onde você é?"],["I am from Brazil.","Eu sou do Brasil."]],
    fills: [["I ___ from Brazil.","am",["am","is","are"],"Com \"I\" (eu) o verbo to be é sempre \"am\"."],["She ___ my friend.","is",["am","is","are"],"Com he/she/it usamos \"is\"."],["We ___ students.","are",["am","is","are"],"Com we/you/they usamos \"are\"."]]
  },
  {
    id: "u02", cefr: "A1", title: "No café", topic: "restaurantes",
    goal: "Pedir comida e bebida com educação",
    words: [["coffee","café"],["water","água"],["bread","pão"],["cheese","queijo"],["menu","cardápio"],["bill","conta"],["small","pequeno"],["large","grande"]],
    sentences: [["Can I have a coffee, please?","Pode me dar um café, por favor?"],["I would like some water.","Eu gostaria de um pouco de água."],["How much is it?","Quanto custa?"],["Can I have the bill, please?","Pode me trazer a conta, por favor?"],["For here or to go?","Para comer aqui ou para viagem?"],["To go, please.","Para viagem, por favor."]],
    fills: [["Can I ___ a coffee, please?","have",["have","has","having"],"\"Can I have...?\" é o jeito educado de pedir algo."],["I would ___ some water.","like",["like","likes","liking"],"Depois de \"would\" o verbo fica na forma base: would like."],["How ___ is it?","much",["much","many","more"],"Para preço usamos \"How much\"."]]
  },
  {
    id: "u03", cefr: "A1", title: "Família e casa", topic: "dia a dia",
    goal: "Falar sobre a família e onde você mora",
    words: [["mother","mãe"],["father","pai"],["brother","irmão"],["sister","irmã"],["house","casa"],["kitchen","cozinha"],["bedroom","quarto"],["children","filhos / crianças"]],
    sentences: [["I have two brothers.","Eu tenho dois irmãos."],["My sister lives in São Paulo.","Minha irmã mora em São Paulo."],["This is my mother.","Esta é minha mãe."],["Our house is small.","Nossa casa é pequena."],["Do you have children?","Você tem filhos?"],["The kitchen is next to the bedroom.","A cozinha fica ao lado do quarto."]],
    fills: [["My sister ___ in São Paulo.","lives",["live","lives","living"],"Com he/she/it, o verbo no presente ganha -s: she lives."],["___ you have children?","Do",["Do","Does","Are"],"Perguntas com you usam \"Do\"."],["This is ___ mother.","my",["my","me","I"],"\"My\" é o possessivo (meu/minha)."]]
  },
  {
    id: "u04", cefr: "A1", title: "Minha rotina", topic: "dia a dia",
    goal: "Descrever o seu dia com o presente simples",
    words: [["wake up","acordar"],["breakfast","café da manhã"],["work","trabalhar / trabalho"],["lunch","almoço"],["dinner","jantar"],["always","sempre"],["never","nunca"],["every day","todo dia"]],
    sentences: [["I wake up at seven.","Eu acordo às sete."],["She works every day.","Ela trabalha todo dia."],["I always have breakfast.","Eu sempre tomo café da manhã."],["He never eats meat.","Ele nunca come carne."],["What time do you have lunch?","Que horas você almoça?"],["We have dinner at eight.","Nós jantamos às oito."]],
    fills: [["She ___ every day.","works",["work","works","working"],"Ela = she → verbo com -s no presente simples."],["He ___ eats meat.","never",["never","always","don't"],"\"Never\" já é negativo; não usamos \"don't\" junto."],["What time ___ you have lunch?","do",["do","does","are"],"Pergunta com you no presente simples: do."]]
  },
  {
    id: "u05", cefr: "A1", title: "Compras", topic: "compras",
    goal: "Perguntar preços, tamanhos e pagar",
    words: [["shirt","camisa"],["shoes","sapatos"],["price","preço"],["cheap","barato"],["expensive","caro"],["size","tamanho"],["cash","dinheiro vivo"],["card","cartão"]],
    sentences: [["How much are these shoes?","Quanto custam estes sapatos?"],["Do you have this in a medium size?","Vocês têm isso no tamanho médio?"],["It is too expensive.","Está caro demais."],["Can I pay by card?","Posso pagar com cartão?"],["I am just looking, thanks.","Só estou olhando, obrigado."],["Can I try it on?","Posso experimentar?"]],
    fills: [["How much ___ these shoes?","are",["is","are","am"],"\"Shoes\" está no plural, então usamos \"are\"."],["Can I pay ___ card?","by",["by","with","in"],"Em inglês se diz \"pay by card\" (ou \"pay in cash\")."],["It is ___ expensive.","too",["too","to","two"],"\"Too\" = demais. \"To\" é preposição e \"two\" é o número 2."]]
  },
  {
    id: "u06", cefr: "A2", title: "Aeroporto e viagem", topic: "viagens",
    goal: "Fazer check-in, achar o portão e lidar com imprevistos",
    words: [["flight","voo"],["passport","passaporte"],["boarding pass","cartão de embarque"],["gate","portão"],["luggage","bagagem"],["delayed","atrasado"],["window seat","assento na janela"],["arrival","chegada"]],
    sentences: [["Where is gate twelve?","Onde fica o portão doze?"],["My flight is delayed.","Meu voo está atrasado."],["Can I have a window seat?","Posso ficar no assento da janela?"],["I have one bag to check.","Tenho uma mala para despachar."],["What time does boarding start?","Que horas começa o embarque?"],["I lost my luggage.","Perdi minha bagagem."]],
    fills: [["What time ___ boarding start?","does",["do","does","is"],"\"Boarding\" é he/she/it → usamos \"does\" na pergunta."],["I ___ my luggage yesterday.","lost",["lose","lost","losing"],"\"Yesterday\" pede passado: lose → lost."],["My flight ___ delayed.","is",["is","are","am"],"\"My flight\" é singular: is."]]
  },
  {
    id: "u07", cefr: "A2", title: "No hotel", topic: "viagens",
    goal: "Reservar, fazer check-in e resolver problemas no quarto",
    words: [["reservation","reserva"],["room","quarto"],["key","chave"],["towel","toalha"],["check out","fazer check-out"],["available","disponível"],["floor","andar"],["broken","quebrado"]],
    sentences: [["I have a reservation under Silva.","Tenho uma reserva no nome de Silva."],["Is breakfast included?","O café da manhã está incluído?"],["The air conditioning is broken.","O ar-condicionado está quebrado."],["Could I have an extra towel?","Poderia me dar uma toalha extra?"],["What time is check-out?","Que horas é o check-out?"],["Do you have a room available tonight?","Vocês têm um quarto disponível hoje à noite?"]],
    fills: [["___ I have an extra towel?","Could",["Could","Would","Should"],"\"Could I...?\" é um pedido educado."],["Is breakfast ___?","included",["include","included","including"],"Aqui usamos o particípio: \"included\" (incluído)."],["My room is on the third ___.","floor",["floor","flour","flor"],"\"Floor\" = andar. \"Flour\" é farinha."]]
  },
  {
    id: "u08", cefr: "A2", title: "Fim de semana", topic: "amizades",
    goal: "Contar o que você fez usando o passado simples",
    words: [["went","foi / fui"],["saw","viu / vi"],["ate","comeu / comi"],["bought","comprou / comprei"],["yesterday","ontem"],["last weekend","fim de semana passado"],["beach","praia"],["movie","filme"]],
    sentences: [["I went to the beach last weekend.","Fui à praia no fim de semana passado."],["We saw a great movie.","Vimos um filme ótimo."],["What did you do yesterday?","O que você fez ontem?"],["I didn't go out.","Eu não saí."],["She bought a new phone.","Ela comprou um celular novo."],["Did you have fun?","Você se divertiu?"]],
    fills: [["What ___ you do yesterday?","did",["did","do","done"],"Perguntas no passado usam \"did\" + verbo na forma base."],["I didn't ___ out.","go",["go","went","gone"],"Depois de \"didn't\" o verbo volta para a forma base."],["We ___ a great movie.","saw",["see","saw","seen"],"Passado de \"see\" é \"saw\"."]]
  },
  {
    id: "u09", cefr: "A2", title: "No trabalho", topic: "trabalho",
    goal: "Falar da sua profissão e das tarefas do dia",
    words: [["job","emprego"],["meeting","reunião"],["deadline","prazo"],["boss","chefe"],["coworker","colega de trabalho"],["schedule","agenda / horário"],["busy","ocupado"],["report","relatório"]],
    sentences: [["I work as a nurse.","Eu trabalho como enfermeira."],["I have a meeting at ten.","Tenho uma reunião às dez."],["The deadline is on Friday.","O prazo é na sexta-feira."],["I am very busy today.","Estou muito ocupado hoje."],["Can we reschedule?","Podemos remarcar?"],["I am working on the report.","Estou trabalhando no relatório."]],
    fills: [["I work ___ a nurse.","as",["as","like","how"],"Para profissão usamos \"work as\"."],["The deadline is ___ Friday.","on",["on","in","at"],"Com dias da semana usamos \"on\"."],["I am working ___ the report.","on",["on","in","at"],"\"Work on something\" = trabalhar em algo."]]
  },
  {
    id: "u10", cefr: "B1", title: "Reuniões e e-mails", topic: "reuniões",
    goal: "Participar de reuniões e escrever e-mails claros",
    words: [["agenda","pauta"],["follow up","dar retorno"],["attach","anexar"],["suggest","sugerir"],["agree","concordar"],["issue","problema / questão"],["update","atualização"],["by the end of","até o fim de"]],
    sentences: [["Let's go over the agenda.","Vamos revisar a pauta."],["I'll follow up by email.","Vou dar retorno por e-mail."],["Please find the file attached.","Segue o arquivo em anexo."],["I see your point, but I disagree.","Entendo seu ponto, mas discordo."],["Could you send me an update by the end of the day?","Você poderia me mandar uma atualização até o fim do dia?"],["I suggest we postpone the launch.","Sugiro que adiemos o lançamento."]],
    fills: [["I'll follow up ___ email.","by",["by","in","for"],"Meio de comunicação: by email, by phone."],["I suggest we ___ the launch.","postpone",["postpone","postponing","to postpone"],"Depois de \"suggest we\" usamos o verbo na forma base."],["I ___ with you on that.","agree",["agree","am agree","agreed with"],"Em inglês não se diz \"I am agree\": o certo é \"I agree\"."]]
  },
  {
    id: "u11", cefr: "B1", title: "Entrevista de emprego", topic: "trabalho",
    goal: "Falar de experiência, pontos fortes e objetivos",
    words: [["experience","experiência"],["strength","ponto forte"],["weakness","ponto fraco"],["skills","habilidades"],["team","equipe"],["goal","objetivo"],["salary","salário"],["hire","contratar"]],
    sentences: [["I have five years of experience in sales.","Tenho cinco anos de experiência em vendas."],["My main strength is problem-solving.","Meu principal ponto forte é resolver problemas."],["I work well in a team.","Eu trabalho bem em equipe."],["I have been working here since 2021.","Trabalho aqui desde 2021."],["Why do you want this job?","Por que você quer este emprego?"],["I'm looking for new challenges.","Estou buscando novos desafios."]],
    fills: [["I have been working here ___ 2021.","since",["since","for","from"],"\"Since\" marca o ponto de início; \"for\" marca a duração (for three years)."],["I have five years ___ experience.","of",["of","in","with"],"\"Years of experience\" — a preposição é \"of\"."],["I'm looking ___ new challenges.","for",["for","to","at"],"\"Look for\" = procurar."]]
  },
  {
    id: "u12", cefr: "B1", title: "Opiniões e planos", topic: "conversa",
    goal: "Dar opiniões e falar de planos e hipóteses",
    words: [["I think","eu acho"],["in my opinion","na minha opinião"],["going to","vai / vou (plano)"],["probably","provavelmente"],["would","(tempo condicional)"],["if","se"],["although","embora"],["maybe","talvez"]],
    sentences: [["In my opinion, it's a good idea.","Na minha opinião, é uma boa ideia."],["I'm going to travel next year.","Vou viajar no ano que vem."],["If I had more time, I would learn to surf.","Se eu tivesse mais tempo, aprenderia a surfar."],["It will probably rain tomorrow.","Provavelmente vai chover amanhã."],["Although it was late, we kept talking.","Embora estivesse tarde, continuamos conversando."],["What would you do in my place?","O que você faria no meu lugar?"]],
    fills: [["If I had more time, I ___ learn to surf.","would",["would","will","am"],"Hipótese: if + passado → would + verbo."],["I'm going ___ travel next year.","to",["to","for","—"],"Plano futuro: be going to + verbo."],["It ___ probably rain tomorrow.","will",["will","would","is"],"Previsão sobre o futuro: will."]]
  }
];

/* Teste inicial de nivelamento: [pergunta, resposta, opções, banda CEFR] */
window.LUE_PLACEMENT = [
  ["Como se diz \"obrigado\"?","thank you",["please","thank you","sorry","hello"],"A1"],
  ["She ___ a doctor.","is",["am","is","are","be"],"A1"],
  ["Escolha a tradução: \"Quanto custa?\"","How much is it?",["How many is it?","How much is it?","What cost it?","How is price?"],"A1"],
  ["They ___ to the beach every Sunday.","go",["goes","go","going","went to"],"A1"],
  ["I ___ my keys yesterday.","lost",["lose","lost","losed","have lost"],"A2"],
  ["___ you ever been to London?","Have",["Did","Have","Are","Do"],"A2"],
  ["The meeting is ___ Monday.","on",["in","at","on","by"],"A2"],
  ["He's taller ___ his brother.","than",["that","then","than","as"],"A2"],
  ["If it rains, we ___ stay home.","will",["would","will","are","did"],"B1"],
  ["I've lived here ___ ten years.","for",["since","for","during","from"],"B1"],
  ["She asked me where I ___.","lived",["live","lived","do live","living"],"B1"],
  ["If I ___ you, I'd take the job.","were",["am","was being","were","be"],"B2"],
  ["The report ___ by the time the boss arrived.","had been finished",["finished","has finished","had been finished","was finishing"],"B2"],
  ["I wish I ___ more attention in class.","had paid",["paid","had paid","would pay","pay"],"B2"],
  ["Hardly ___ the house when it started raining.","had I left",["I had left","had I left","I left","did I leave"],"C1"]
];

window.LUE_SCENARIOS = [
  { id: "free", title: "Conversa livre", desc: "Fale sobre qualquer assunto", opener: "Hi! I'm your English teacher. What would you like to talk about today?" },
  { id: "cafe", title: "Pedir um café", desc: "Você é o cliente numa cafeteria", opener: "Good morning! Welcome to Sunny Café. What can I get for you?" },
  { id: "foreigner", title: "Conversar com um estrangeiro", desc: "Um turista puxa conversa com você", opener: "Hey, excuse me! Is this your city? I'm visiting from Canada and I'm a bit lost." },
  { id: "interview", title: "Entrevista de emprego", desc: "Você é o candidato", opener: "Thanks for coming in today. Could you start by telling me a little about yourself?" },
  { id: "hotel", title: "Reservar um hotel", desc: "Você liga para a recepção", opener: "Good evening, Harbor View Hotel, this is Sam speaking. How can I help you?" },
  { id: "restaurant", title: "Jantar num restaurante", desc: "Peça, tire dúvidas e pague a conta", opener: "Good evening! Do you have a reservation, or is it a table for one?" },
  { id: "airport", title: "Check-in no aeroporto", desc: "Você está no balcão da companhia", opener: "Hello, may I see your passport and booking reference, please?" }
];
