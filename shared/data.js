/* ==========================================================================
   Manjericão Produtos Naturais — dados compartilhados (site + painel)
   --------------------------------------------------------------------------
   BETA DE DEMONSTRAÇÃO. Tudo fica no localStorage do navegador, então o site
   e o painel abertos no MESMO navegador conversam entre si (um pedido feito
   no site aparece no painel na hora, inclusive em outra aba).
   Em produção isso vira Supabase, com o mesmo formato de objetos.

   Preços, estoques, clientes, pedidos, nutris e candidaturas são EXEMPLO
   (campo exemplo:true). Produtos com real:true foram vistos no Instagram
   da loja; o preço deles também é ilustrativo.

   Uso:  <script src="shared/data.js"></script>   (no painel: ../shared/data.js)
         const db = MJ.db();  ...altera...  MJ.save(db);
         MJ.on(db => render(db));   // atualiza quando qualquer aba salvar
   ========================================================================== */
(function () {
  'use strict';

  var KEY = 'manjericao_db_v1';
  var VERSION = 1;
  var DIA = 86400000;

  /* ---------------------------------------------------------------- marca */
  var MARCA = {
    nome: 'Manjericão Produtos Naturais',
    curto: 'Manjericão',
    slogan: 'Comer bem para viver melhor!',
    pilares: 'Granel · Suplementos · Cafeteria',
    instagram: 'https://www.instagram.com/manjericao_produtosnaturais/',
    instagramUser: '@manjericao_produtosnaturais',
    seguidores: '9,4 mil',
    whatsappCentral: '557188939116', // botão "FALE" do bio.site
    cores: {
      verde: '#5E8A2E',      // folha do logo
      verdeEscuro: '#2F4A1C',
      verdeClaro: '#A7C66B',
      marrom: '#5A3B26',     // café / letreiro
      marromEscuro: '#3B2617',
      creme: '#F6F0E3',
      papel: '#FBF8F1',
      kraft: '#D9C2A0',
      dourado: '#C9973A'
    }
  };

  /* ------------------------------------------------------------- unidades */
  /* Números do bio.site/manjericaonaturais (botões DD, ST, SSA).
     Endereço exato e horário: A CONFIRMAR com a loja. */
  var UNIDADES = [
    {
      id: 'maxcenter',
      nome: 'Max Center',
      bairro: 'Itaigara',
      cidade: 'Salvador',
      endereco: 'Max Center Shopping · Itaigara, Salvador/BA',
      whatsapp: '557196188348',
      horario: 'Seg a sáb · horário a confirmar',
      cafeteria: true,
      mapa: 'https://www.google.com/maps/search/?api=1&query=Max+Center+Shopping+Itaigara+Salvador',
      confirmar: true
    },
    {
      id: 'tricenter',
      nome: 'Shopping Tricenter',
      bairro: '',
      cidade: 'Salvador',
      endereco: 'Shopping Tricenter · Salvador/BA',
      whatsapp: '5571999625083',
      horario: 'Horário a confirmar',
      cafeteria: true,
      mapa: 'https://www.google.com/maps/search/?api=1&query=Shopping+Tricenter+Salvador',
      confirmar: true
    },
    {
      id: 'diasdavila',
      nome: "Dias D'Ávila",
      bairro: 'Centro',
      cidade: "Dias D'Ávila",
      endereco: "Dias D'Ávila/BA · endereço a confirmar",
      whatsapp: '5571996338830',
      horario: 'Horário a confirmar',
      cafeteria: false,
      mapa: "https://www.google.com/maps/search/?api=1&query=Manjeric%C3%A3o+Produtos+Naturais+Dias+D'%C3%81vila",
      confirmar: true
    }
  ];

  /* ----------------------------------------------------------- categorias */
  var CATEGORIAS = [
    { id: 'granel',       nome: 'Granel',              icone: '🌰', desc: 'Castanhas, sementes, grãos e frutas secas — você leva só o quanto precisa.' },
    { id: 'suplementos',  nome: 'Suplementos',         icone: '💪', desc: 'Proteínas, creatina, colágeno e vitaminas para a sua rotina.' },
    { id: 'mercearia',    nome: 'Mercearia natural',   icone: '🫙', desc: 'Pastas, vinagres, óleos e adoçantes naturais.' },
    { id: 'chas',         nome: 'Chás',                icone: '🫖', desc: 'Sachês e ervas para desacelerar.' },
    { id: 'snacks',       nome: 'Snacks & lancheira',  icone: '🎒', desc: 'Lanchinhos práticos, muitos sem glúten e sem lactose.' },
    { id: 'bebidas',      nome: 'Bebidas funcionais',  icone: '🥤', desc: 'Para hidratar com propósito.' },
    { id: 'chocolates',   nome: 'Chocolates',          icone: '🍫', desc: 'Intensos, zero açúcar e drágeas.' },
    { id: 'aromaterapia', nome: 'Aromaterapia',        icone: '🌿', desc: 'Óleos essenciais para casa e autocuidado.' }
  ];

  /* Opções de peso para produtos a granel (gramas) */
  var PESOS = [100, 250, 500, 1000];

  /* ------------------------------------------------------------- produtos */
  /* tipo 'kg' => preco é por quilo, estoque em kg, cliente escolhe o peso.
     tipo 'un' => preco por unidade, estoque em unidades.
     promo: preço promocional (mesma base do preco) ou null.
     img: caminho relativo à RAIZ do site (o painel prefixa '../').         */
  function P(id, nome, categoria, tipo, preco, extra) {
    var p = {
      id: id, nome: nome, categoria: categoria, tipo: tipo, preco: preco,
      promo: null, marca: '', medida: '', desc: '', tags: [], img: null,
      destaque: false, ativo: true, real: false, exemplo: true,
      estoque: {}, estoqueMin: tipo === 'kg' ? 2 : 4
    };
    for (var k in extra) p[k] = extra[k];
    return p;
  }

  function produtosSeed() {
    var L = [
      /* ---- Granel (R$/kg) ---- */
      P('castanha-caju', 'Castanha de caju W1', 'granel', 'kg', 89.9, { tags: ['vegano', 'sem glúten'], destaque: true, promo: 79.9, desc: 'Inteira, crocante, ótima para lanches e receitas.' }),
      P('castanha-para', 'Castanha-do-pará', 'granel', 'kg', 109.9, { tags: ['vegano', 'fonte de selênio'], desc: 'Uma por dia já ajuda a bater a meta de selênio.' }),
      P('amendoa', 'Amêndoa torrada sem sal', 'granel', 'kg', 99.9, { tags: ['vegano', 'sem glúten'] }),
      P('nozes', 'Nozes chilenas', 'granel', 'kg', 119.9, { tags: ['vegano', 'ômega 3'] }),
      P('mix-castanhas', 'Mix de castanhas premium', 'granel', 'kg', 94.9, { tags: ['vegano'], destaque: true, desc: 'Caju, pará, amêndoa e nozes na medida.' }),
      P('granola', 'Granola artesanal sem açúcar', 'granel', 'kg', 49.9, { tags: ['zero açúcar'], destaque: true, promo: 42.9, desc: 'Aveia, castanhas, coco e mel — para o iogurte ou o açaí.' }),
      P('aveia', 'Aveia em flocos', 'granel', 'kg', 19.9, { tags: ['fibras'] }),
      P('chia', 'Semente de chia', 'granel', 'kg', 39.9, { tags: ['vegano', 'ômega 3'] }),
      P('linhaca', 'Linhaça dourada', 'granel', 'kg', 24.9, { tags: ['vegano', 'fibras'] }),
      P('semente-abobora', 'Semente de abóbora', 'granel', 'kg', 79.9, { tags: ['vegano', 'fonte de zinco'] }),
      P('uva-passa', 'Uva-passa preta', 'granel', 'kg', 39.9, { tags: ['vegano'] }),
      P('damasco', 'Damasco turco', 'granel', 'kg', 119.9, { tags: ['vegano'] }),
      P('cranberry', 'Cranberry desidratada', 'granel', 'kg', 79.9, { tags: ['vegano'] }),
      P('cacau-po', 'Cacau em pó 100%', 'granel', 'kg', 89.9, { tags: ['vegano', 'zero açúcar'] }),
      P('farinha-amendoa', 'Farinha de amêndoa', 'granel', 'kg', 129.9, { tags: ['sem glúten', 'low carb'] }),
      P('quinoa', 'Quinoa em grãos', 'granel', 'kg', 49.9, { tags: ['vegano', 'sem glúten'] }),
      P('acucar-coco', 'Açúcar de coco', 'granel', 'kg', 59.9, { tags: ['vegano'] }),
      P('drageas', 'Drágeas de castanha com chocolate', 'chocolates', 'kg', 119.9, { desc: 'Castanha de caju coberta com chocolate meio amargo.' }),
      P('hibisco', 'Hibisco desidratado', 'chas', 'kg', 89.9, { tags: ['vegano'], desc: 'Flor para infusão, sem cafeína.' }),

      /* ---- Suplementos ---- */
      P('whey-900', 'Whey Protein concentrado 900 g', 'suplementos', 'un', 159.9, { medida: '900 g', tags: ['24 g de proteína'], destaque: true, promo: 139.9 }),
      P('creatina-300', 'Creatina monohidratada 300 g', 'suplementos', 'un', 99.9, { medida: '300 g', destaque: true }),
      P('colageno-300', 'Colágeno hidrolisado + vitamina C', 'suplementos', 'un', 79.9, { medida: '300 g' }),
      P('omega3', 'Ômega 3 · 120 cápsulas', 'suplementos', 'un', 69.9, { medida: '120 cáps.' }),
      P('multi', 'Multivitamínico A–Z · 60 cápsulas', 'suplementos', 'un', 49.9, { medida: '60 cáps.' }),
      P('barra-proteina', 'Barra de proteína', 'suplementos', 'un', 9.9, { medida: '45 g', tags: ['15 g de proteína'] }),

      /* ---- Mercearia (inclui produtos vistos no Instagram) ---- */
      P('pasta-amendoim-crocante', 'Pasta de amendoim Integral Crocante', 'mercearia', 'un', 54.9, { marca: 'Power1One', medida: '1,005 kg', real: true, destaque: true, img: 'assets/img/pasta-amendoim.jpg', desc: 'Visto no nosso Instagram: perfeita no café da manhã e nas receitas.' }),
      P('pasta-amendoim-tradicional', 'Pasta de amendoim Integral Tradicional', 'mercearia', 'un', 54.9, { marca: 'Power1One', medida: '1,005 kg', real: true, img: 'assets/img/pasta-amendoim.jpg' }),
      P('vinagre-maca', 'Vinagre de fruta maçã orgânico', 'mercearia', 'un', 24.9, { marca: 'Fazenda São Roque', medida: '500 ml', tags: ['orgânico'], real: true, img: 'assets/img/alimentacao-graos.jpg' }),
      P('azeite', 'Azeite extravirgem', 'mercearia', 'un', 49.9, { medida: '500 ml' }),
      P('oleo-coco', 'Óleo de coco extravirgem', 'mercearia', 'un', 39.9, { medida: '500 ml', tags: ['vegano'] }),
      P('mel', 'Mel puro de florada', 'mercearia', 'un', 34.9, { medida: '500 g' }),

      /* ---- Chás ---- */
      P('cha-camomila', 'Chá de camomila', 'chas', 'un', 7.9, { marca: 'Chá Prenda', medida: '10 sachês', real: true, img: 'assets/img/cha-prenda.jpg' }),
      P('cha-erva-doce', 'Chá de erva-doce Linha Gold', 'chas', 'un', 8.9, { marca: 'Chá Prenda', medida: '15 sachês', real: true, img: 'assets/img/cha-prenda.jpg' }),

      /* ---- Snacks & lancheira (vistos no post do Dia das Crianças) ---- */
      P('yamo-queijo', 'Snack sabor queijo', 'snacks', 'un', 6.9, { marca: 'Yamo', medida: '25 g', tags: ['sem glúten', 'sem lactose'], real: true, img: 'assets/img/lancheira.jpg' }),
      P('yamo-ervas', 'Snack sabor ervas finas', 'snacks', 'un', 6.9, { marca: 'Yamo', medida: '25 g', tags: ['sem glúten', 'sem lactose'], real: true, img: 'assets/img/lancheira.jpg' }),
      P('vitao-spidey', 'Snack Spidey sabor cheddar', 'snacks', 'un', 7.9, { marca: 'Vitao', medida: 'pacote', tags: ['sem glúten'], real: true, img: 'assets/img/lancheira.jpg' }),
      P('banana-minions', 'Barrinha de banana Minions', 'snacks', 'un', 3.9, { marca: 'Banana Brasil Kids', medida: 'unidade', real: true, img: 'assets/img/lancheira.jpg' }),

      /* ---- Bebidas ---- */
      P('prota-limao', 'Água gaseificada com proteína e colágeno — limão', 'bebidas', 'un', 12.9, { marca: 'Protá Water Protein', medida: 'garrafa', tags: ['5 g de proteína', 'zero açúcar', 'zero calorias'], real: true, destaque: true, img: 'assets/img/prota-water.jpg', desc: 'Novidade! Refrescante, prática e nutritiva.' }),
      P('kombucha', 'Kombucha', 'bebidas', 'un', 14.9, { medida: '355 ml', tags: ['probiótico'] }),

      /* ---- Chocolates ---- */
      P('choco-70', 'Chocolate 70% cacau', 'chocolates', 'un', 18.9, { medida: '80 g', tags: ['vegano'] }),
      P('choco-zero', 'Chocolate ao leite zero açúcar', 'chocolates', 'un', 16.9, { medida: '80 g', tags: ['zero açúcar'], promo: 13.9 }),

      /* ---- Aromaterapia ---- */
      P('oe-lavanda', 'Óleo essencial de lavanda', 'aromaterapia', 'un', 39.9, { medida: '10 ml' }),
      P('oe-laranja', 'Óleo essencial de laranja-doce', 'aromaterapia', 'un', 24.9, { medida: '10 ml' })
    ];

    // estoque de exemplo por unidade (determinístico)
    var r = rng(7);
    L.forEach(function (p, i) {
      UNIDADES.forEach(function (u) {
        var v = p.tipo === 'kg' ? Math.round((1 + r() * 9) * 10) / 10 : Math.floor(r() * 26);
        p.estoque[u.id] = v;
      });
    });
    // alguns itens com estoque baixo para o painel ter alerta
    var baixo = { 'nozes': ['maxcenter', 0.8], 'creatina-300': ['maxcenter', 2], 'cha-camomila': ['diasdavila', 0], 'prota-limao': ['tricenter', 1] };
    L.forEach(function (p) { if (baixo[p.id]) p.estoque[baixo[p.id][0]] = baixo[p.id][1]; });
    return L;
  }

  /* ------------------------------------------------------ cardápio café */
  var CARDAPIO_CATS = [
    { id: 'cafes', nome: 'Cafés' },
    { id: 'naturais', nome: 'Sucos & smoothies' },
    { id: 'salgados', nome: 'Salgados & lanches' },
    { id: 'doces', nome: 'Docinhos' }
  ];

  function C(id, nome, categoria, preco, desc, extra) {
    var c = { id: id, nome: nome, categoria: categoria, preco: preco, desc: desc || '', ativo: true, destaque: false, tags: [], exemplo: true };
    for (var k in extra) c[k] = extra[k];
    return c;
  }

  function cardapioSeed() {
    return [
      C('espresso', 'Espresso', 'cafes', 6, 'Curto e encorpado.'),
      C('espresso-duplo', 'Espresso duplo', 'cafes', 9, 'Para quem precisa de energia dobrada.'),
      C('cappuccino', 'Cappuccino da casa', 'cafes', 11, 'Espresso, leite vaporizado e canela.', { destaque: true, img: 'assets/img/cappuccino.jpg' }),
      C('latte-vegetal', 'Latte com leite vegetal', 'cafes', 13, 'Com bebida de aveia ou amêndoa.', { tags: ['vegano'] }),
      C('mocha', 'Mocha com cacau 70%', 'cafes', 13, 'Espresso, cacau e leite.'),
      C('cha-dia', 'Chá do dia', 'cafes', 7, 'Pergunte qual é a erva de hoje.'),
      C('suco-verde', 'Suco verde', 'naturais', 12, 'Couve, abacaxi, limão e gengibre.', { tags: ['vegano'], destaque: true }),
      C('suco-laranja', 'Suco de laranja', 'naturais', 10, 'Espremido na hora.'),
      C('smoothie', 'Smoothie de frutas vermelhas', 'naturais', 16, 'Com iogurte natural e granola.'),
      C('pao-queijo', 'Pão de queijo', 'salgados', 6, 'Quentinho, saindo do forno.', { tags: ['sem glúten'] }),
      C('crepioca', 'Crepioca recheada', 'salgados', 18, 'Frango ou queijo branco com tomate.', { tags: ['sem glúten'], destaque: true }),
      C('tapioca', 'Tapioca de queijo coalho', 'salgados', 15, 'Com orégano e azeite.', { tags: ['sem glúten'] }),
      C('sanduiche-natural', 'Sanduíche natural de frango', 'salgados', 16, 'Pão integral, frango, cenoura e ricota.'),
      C('empada', 'Empada integral', 'salgados', 9, 'Frango ou palmito.'),
      C('bolo-banana', 'Bolo integral de banana', 'doces', 9, 'Fatia, sem açúcar refinado.', { tags: ['sem açúcar refinado'] }),
      C('brownie', 'Brownie fit', 'doces', 10, 'Cacau 70% e farinha de amêndoa.', { tags: ['sem glúten'] }),
      C('cookie-aveia', 'Cookie de aveia e castanha', 'doces', 7, 'Crocante por fora, macio por dentro.')
    ];
  }

  /* ------------------------------------------------------------- status */
  var STATUS = [
    { id: 'novo',      nome: 'Novo',              cor: '#C9973A' },
    { id: 'separando', nome: 'Separando',         cor: '#3B82C4' },
    { id: 'pronto',    nome: 'Pronto p/ retirar', cor: '#5E8A2E' },
    { id: 'saiu',      nome: 'Saiu p/ entrega',   cor: '#7A4FB5' },
    { id: 'concluido', nome: 'Concluído',         cor: '#4B5563' },
    { id: 'cancelado', nome: 'Cancelado',         cor: '#B42318' }
  ];

  var PAGAMENTOS = [
    { id: 'pix', nome: 'Pix' },
    { id: 'cartao', nome: 'Cartão (débito/crédito)' },
    { id: 'dinheiro', nome: 'Dinheiro' }
  ];

  var VAGAS = ['Atendente de loja', 'Barista / cafeteria', 'Operador(a) de caixa', 'Estoquista', 'Outra'];

  /* -------------------------------------------------------------- utils */
  function rng(seed) { // PRNG determinístico (mulberry32)
    var a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function uid(prefixo) {
    return (prefixo || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function r2(n) { return Math.round(n * 100) / 100; }
  function fmt(n) {
    return 'R$ ' + (Number(n) || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  function soDigitos(s) { return String(s || '').replace(/\D/g, ''); }
  function fmtFone(s) {
    var d = soDigitos(s);
    if (d.indexOf('55') === 0 && d.length >= 12) d = d.slice(2);
    if (d.length === 11) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
    if (d.length === 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return s || '';
  }
  function fmtPeso(g) { return g >= 1000 ? (g / 1000).toString().replace('.', ',') + ' kg' : g + ' g'; }
  function fmtData(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' +
      d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  function wa(numero, texto) {
    return 'https://wa.me/' + soDigitos(numero) + (texto ? '?text=' + encodeURIComponent(texto) : '');
  }

  /* --------------------------------------------------------- dados seed */
  var NOMES = ['Juliana Santos', 'Carlos Menezes', 'Fernanda Rocha', 'Rafael Oliveira', 'Patrícia Lima',
    'Bruno Carvalho', 'Aline Souza', 'Marcos Andrade', 'Camila Ferreira', 'Thiago Barreto',
    'Luciana Prado', 'Gabriel Nascimento', 'Renata Costa', 'Diego Almeida'];
  var BAIRROS = ['Itaigara', 'Pituba', 'Caminho das Árvores', 'Stiep', 'Imbuí', 'Costa Azul', 'Brotas', "Dias D'Ávila"];

  function seed() {
    var agora = Date.now();
    var r = rng(42);
    var produtos = produtosSeed();
    var vendaveis = produtos.filter(function (p) { return p.ativo; });

    var clientes = NOMES.map(function (nome, i) {
      return {
        id: 'cli_' + (i + 1),
        nome: nome,
        whatsapp: '55719' + String(80000000 + Math.floor(r() * 9999999)).slice(0, 8),
        bairro: BAIRROS[i % BAIRROS.length],
        unidadeId: UNIDADES[i % 3].id,
        aceitaOfertas: r() > 0.35,
        origem: i % 4 === 0 ? 'clube' : 'site',
        tags: i % 5 === 0 ? ['suplementos'] : (i % 3 === 0 ? ['granel'] : []),
        criadoEm: new Date(agora - (20 + i * 3) * DIA).toISOString(),
        exemplo: true
      };
    });

    var nutris = [
      { id: 'nut_1', nome: 'Ana Paula Ribeiro', crn: 'CRN-5 0000', whatsapp: '5571980000101', instagram: '@exemplo.nutri.ana', cupom: 'NUTRIANA', desconto: 10, status: 'ativa', criadoEm: new Date(agora - 40 * DIA).toISOString(), exemplo: true },
      { id: 'nut_2', nome: 'Rodrigo Teles', crn: 'CRN-5 0001', whatsapp: '5571980000102', instagram: '@exemplo.nutri.rodrigo', cupom: 'NUTRIRODRIGO', desconto: 10, status: 'ativa', criadoEm: new Date(agora - 25 * DIA).toISOString(), exemplo: true },
      { id: 'nut_3', nome: 'Beatriz Moura', crn: 'CRN-5 0002', whatsapp: '5571980000103', instagram: '@exemplo.nutri.bia', cupom: 'NUTRIBIA', desconto: 10, status: 'pendente', criadoEm: new Date(agora - 1 * DIA).toISOString(), exemplo: true }
    ];

    var pedidos = [];
    var seq = 1040;
    for (var i = 0; i < 34; i++) {
      var diasAtras = Math.floor(i / 2.4);
      var hora = 9 + Math.floor(r() * 10);
      var quando = new Date(agora - diasAtras * DIA);
      quando.setHours(hora, Math.floor(r() * 60), 0, 0);
      if (quando.getTime() > agora) quando = new Date(agora - (i + 1) * 17 * 60000);
      var cli = clientes[Math.floor(r() * clientes.length)];
      var unidade = UNIDADES[Math.floor(r() * 10) % 3];
      var n = 1 + Math.floor(r() * 4);
      var itens = [];
      var usados = {};
      for (var k = 0; k < n; k++) {
        var p = vendaveis[Math.floor(r() * vendaveis.length)];
        if (usados[p.id]) continue;
        usados[p.id] = 1;
        if (p.tipo === 'kg') {
          var g = PESOS[Math.floor(r() * 3)];
          var pk = precoBase(p);
          itens.push({ produtoId: p.id, nome: p.nome, tipo: 'kg', gramas: g, qtd: 1, precoUnit: r2(pk * g / 1000), subtotal: r2(pk * g / 1000) });
        } else {
          var q = 1 + Math.floor(r() * 2);
          itens.push({ produtoId: p.id, nome: p.nome, tipo: 'un', qtd: q, precoUnit: precoBase(p), subtotal: r2(precoBase(p) * q) });
        }
      }
      var subtotal = r2(itens.reduce(function (s, it) { return s + it.subtotal; }, 0));
      var entrega = r() > 0.55;
      var nutri = r() > 0.8 ? nutris[Math.floor(r() * 2)] : null;
      var desconto = nutri ? r2(subtotal * nutri.desconto / 100) : 0;
      var taxa = entrega ? (subtotal - desconto >= CONFIG_PADRAO.entrega.gratisAcima ? 0 : CONFIG_PADRAO.entrega.taxa) : 0;
      var status;
      if (diasAtras === 0) status = ['novo', 'novo', 'separando', 'pronto', 'saiu'][i % 5];
      else if (diasAtras === 1) status = i % 7 === 0 ? 'cancelado' : 'concluido';
      else status = i % 11 === 0 ? 'cancelado' : 'concluido';
      if (status === 'saiu' && !entrega) status = 'pronto';
      if (status === 'pronto' && entrega) status = 'saiu';
      seq++;
      pedidos.push({
        id: 'MJ' + seq,
        criadoEm: quando.toISOString(),
        atualizadoEm: quando.toISOString(),
        clienteId: cli.id,
        cliente: { nome: cli.nome, whatsapp: cli.whatsapp },
        unidadeId: unidade.id,
        modalidade: entrega ? 'entrega' : 'retirada',
        endereco: entrega ? ('Rua de exemplo, ' + (10 + Math.floor(r() * 400)) + ' · ' + cli.bairro) : '',
        itens: itens,
        subtotal: subtotal,
        cupom: nutri ? nutri.cupom : '',
        nutriId: nutri ? nutri.id : null,
        desconto: desconto,
        taxaEntrega: taxa,
        total: r2(subtotal - desconto + taxa),
        pagamento: PAGAMENTOS[Math.floor(r() * 3)].id,
        obs: '',
        status: status,
        origem: 'site',
        exemplo: true
      });
    }
    pedidos.sort(function (a, b) { return b.criadoEm < a.criadoEm ? -1 : 1; });

    var candidaturas = [
      { id: 'cand_1', nome: 'Larissa Bonfim', whatsapp: '5571980000201', email: 'exemplo1@email.com', vaga: 'Barista / cafeteria', unidadeId: 'maxcenter', mensagem: 'Tenho 1 ano de experiência com espresso e atendimento.', status: 'nova', criadoEm: new Date(agora - 0.3 * DIA).toISOString(), exemplo: true },
      { id: 'cand_2', nome: 'Pedro Henrique Matos', whatsapp: '5571980000202', email: 'exemplo2@email.com', vaga: 'Atendente de loja', unidadeId: 'tricenter', mensagem: 'Gosto muito de alimentação saudável e treino.', status: 'em_analise', criadoEm: new Date(agora - 2 * DIA).toISOString(), exemplo: true },
      { id: 'cand_3', nome: 'Jéssica Araújo', whatsapp: '5571980000203', email: 'exemplo3@email.com', vaga: 'Operador(a) de caixa', unidadeId: 'diasdavila', mensagem: 'Moro perto da loja de Dias D\'Ávila.', status: 'entrevista', criadoEm: new Date(agora - 5 * DIA).toISOString(), exemplo: true }
    ];

    return {
      version: VERSION,
      criadoEm: new Date(agora).toISOString(),
      seq: seq,
      config: JSON.parse(JSON.stringify(CONFIG_PADRAO)),
      campanha: {
        ativa: true,
        titulo: 'Ofertas de Outubro',
        subtitulo: 'Em todas as unidades, enquanto durarem os estoques.',
        validade: '2026-10-31'
      },
      unidades: JSON.parse(JSON.stringify(UNIDADES)),
      produtos: produtos,
      cardapio: cardapioSeed(),
      pedidos: pedidos,
      clientes: clientes,
      nutris: nutris,
      candidaturas: candidaturas
    };
  }

  var CONFIG_PADRAO = {
    entrega: { ativa: true, taxa: 9.9, gratisAcima: 149, obs: 'Entrega por motoboy parceiro em bairros próximos (regra a confirmar).' },
    retirada: { ativa: true, prazo: 'Pronto em até 30 min' },
    pixChave: '',                 // a confirmar
    precosIlustrativos: true,     // mostra aviso discreto no site
    admin: { email: 'admin@manjericao.com.br', senha: 'manjericao' } // só demo
  };

  /* ------------------------------------------------------ persistência */
  var cache = null;
  var ouvintes = [];

  function carregar() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var d = JSON.parse(raw);
        if (d && d.version === VERSION) return d;
      }
    } catch (e) { /* localStorage bloqueado: segue em memória */ }
    var novo = seed();
    gravar(novo);
    return novo;
  }
  function gravar(d) {
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* sem storage */ }
  }
  function db() {
    if (!cache) cache = carregar();
    return cache;
  }
  function save(d) {
    cache = d || cache;
    gravar(cache);
    avisar();
    return cache;
  }
  function avisar() {
    ouvintes.forEach(function (fn) { try { fn(cache); } catch (e) { console.error(e); } });
  }
  function on(fn) { ouvintes.push(fn); return fn; }
  function reset() { cache = seed(); gravar(cache); avisar(); return cache; }

  // outra aba salvou -> recarrega e avisa
  window.addEventListener('storage', function (ev) {
    if (ev.key !== KEY) return;
    cache = null;
    db();
    avisar();
  });

  /* ------------------------------------------------- regras de negócio */
  function precoBase(p) { return (p.promo != null && p.promo > 0 && p.promo < p.preco) ? p.promo : p.preco; }
  function emOferta(p) { return p.promo != null && p.promo > 0 && p.promo < p.preco; }
  function produto(id) { return db().produtos.filter(function (p) { return p.id === id; })[0] || null; }
  function unidade(id) { return db().unidades.filter(function (u) { return u.id === id; })[0] || null; }
  function categoria(id) { return CATEGORIAS.filter(function (c) { return c.id === id; })[0] || null; }
  function status(id) { return STATUS.filter(function (s) { return s.id === id; })[0] || { id: id, nome: id, cor: '#666' }; }
  function estoqueDe(p, unidadeId) { return Number((p.estoque || {})[unidadeId] || 0); }
  function estoqueTotal(p) {
    var e = p.estoque || {}; var t = 0;
    for (var k in e) t += Number(e[k] || 0);
    return Math.round(t * 10) / 10;
  }
  function estoqueBaixo(p, unidadeId) {
    if (unidadeId) return estoqueDe(p, unidadeId) <= p.estoqueMin;
    return db().unidades.some(function (u) { return estoqueDe(p, u.id) <= p.estoqueMin; });
  }
  /* quanto um item consome do estoque (un ou kg) */
  function consumo(item) { return item.tipo === 'kg' ? (item.gramas / 1000) * (item.qtd || 1) : item.qtd; }
  /* preço de 1 item do carrinho: {produtoId, qtd, gramas} */
  function precoItem(p, gramas, qtd) {
    qtd = qtd || 1;
    if (p.tipo === 'kg') return r2(precoBase(p) * (gramas || 100) / 1000 * qtd);
    return r2(precoBase(p) * qtd);
  }

  function validarCupom(codigo) {
    var c = String(codigo || '').trim().toUpperCase();
    if (!c) return { ok: false, msg: '' };
    var n = db().nutris.filter(function (x) { return x.cupom === c; })[0];
    if (!n) return { ok: false, msg: 'Cupom não encontrado.' };
    if (n.status !== 'ativa') return { ok: false, msg: 'Este cupom ainda não foi ativado pela loja.' };
    return { ok: true, nutri: n, desconto: n.desconto, msg: n.desconto + '% de desconto — indicação de ' + n.nome };
  }

  function taxaEntrega(subtotalComDesconto) {
    var e = db().config.entrega;
    if (!e.ativa) return 0;
    return subtotalComDesconto >= e.gratisAcima ? 0 : e.taxa;
  }

  /* calcula totais sem salvar (use no carrinho) */
  function calcular(itensCarrinho, opts) {
    opts = opts || {};
    var itens = [];
    (itensCarrinho || []).forEach(function (it) {
      var p = produto(it.produtoId);
      if (!p || !p.ativo) return;
      var qtd = Math.max(1, parseInt(it.qtd, 10) || 1);
      var linha = { produtoId: p.id, nome: p.nome + (p.marca ? ' · ' + p.marca : ''), tipo: p.tipo, qtd: qtd };
      if (p.tipo === 'kg') {
        linha.gramas = Number(it.gramas) || 100;
        linha.precoUnit = precoItem(p, linha.gramas, 1);
      } else {
        linha.precoUnit = precoBase(p);
      }
      linha.subtotal = r2(linha.precoUnit * qtd);
      itens.push(linha);
    });
    var subtotal = r2(itens.reduce(function (s, i) { return s + i.subtotal; }, 0));
    var cup = validarCupom(opts.cupom);
    var desconto = cup.ok ? r2(subtotal * cup.desconto / 100) : 0;
    var taxa = opts.modalidade === 'entrega' ? taxaEntrega(subtotal - desconto) : 0;
    return { itens: itens, subtotal: subtotal, cupom: cup.ok ? cup.nutri.cupom : '', cupomInfo: cup, nutriId: cup.ok ? cup.nutri.id : null, desconto: desconto, taxaEntrega: taxa, total: r2(subtotal - desconto + taxa) };
  }

  function upsertCliente(d, dados) {
    var fone = soDigitos(dados.whatsapp);
    if (fone && fone.indexOf('55') !== 0) fone = '55' + fone;
    var c = d.clientes.filter(function (x) { return soDigitos(x.whatsapp) === fone; })[0];
    if (!c) {
      c = { id: uid('cli'), nome: dados.nome, whatsapp: fone, bairro: dados.bairro || '', unidadeId: dados.unidadeId || '', aceitaOfertas: !!dados.aceitaOfertas, origem: dados.origem || 'site', tags: [], criadoEm: new Date().toISOString(), exemplo: false };
      d.clientes.unshift(c);
    } else {
      if (dados.nome) c.nome = dados.nome;
      if (dados.bairro) c.bairro = dados.bairro;
      if (dados.unidadeId) c.unidadeId = dados.unidadeId;
      if (dados.aceitaOfertas) c.aceitaOfertas = true;
    }
    return c;
  }

  /* cria pedido a partir do carrinho, baixa estoque e salva.
     dados: {cliente:{nome, whatsapp}, unidadeId, modalidade:'retirada'|'entrega',
             endereco, bairro, itens:[{produtoId, qtd, gramas}], cupom, pagamento, obs, aceitaOfertas} */
  function criarPedido(dados) {
    var d = db();
    var calc = calcular(dados.itens, { cupom: dados.cupom, modalidade: dados.modalidade });
    if (!calc.itens.length) throw new Error('Carrinho vazio.');
    if (!dados.cliente || !dados.cliente.nome || soDigitos(dados.cliente.whatsapp).length < 10) throw new Error('Informe nome e WhatsApp.');
    if (!unidade(dados.unidadeId)) throw new Error('Escolha a unidade.');
    var cli = upsertCliente(d, { nome: dados.cliente.nome, whatsapp: dados.cliente.whatsapp, bairro: dados.bairro, unidadeId: dados.unidadeId, aceitaOfertas: dados.aceitaOfertas });
    d.seq = (d.seq || 1000) + 1;
    var agora = new Date().toISOString();
    var pedido = {
      id: 'MJ' + d.seq,
      criadoEm: agora,
      atualizadoEm: agora,
      clienteId: cli.id,
      cliente: { nome: cli.nome, whatsapp: cli.whatsapp },
      unidadeId: dados.unidadeId,
      modalidade: dados.modalidade === 'entrega' ? 'entrega' : 'retirada',
      endereco: dados.modalidade === 'entrega' ? [dados.endereco, dados.bairro].filter(Boolean).join(' · ') : '',
      itens: calc.itens,
      subtotal: calc.subtotal,
      cupom: calc.cupom,
      nutriId: calc.nutriId,
      desconto: calc.desconto,
      taxaEntrega: calc.taxaEntrega,
      total: calc.total,
      pagamento: dados.pagamento || 'pix',
      obs: dados.obs || '',
      status: 'novo',
      origem: 'site',
      exemplo: false
    };
    // baixa estoque da unidade escolhida
    pedido.itens.forEach(function (it) {
      var p = produto(it.produtoId);
      if (!p) return;
      var atual = estoqueDe(p, pedido.unidadeId);
      p.estoque[pedido.unidadeId] = Math.max(0, Math.round((atual - consumo(it)) * 1000) / 1000);
    });
    d.pedidos.unshift(pedido);
    save(d);
    return pedido;
  }

  /* muda status; cancelar devolve o estoque */
  function mudarStatus(pedidoId, novo) {
    var d = db();
    var p = d.pedidos.filter(function (x) { return x.id === pedidoId; })[0];
    if (!p || p.status === novo) return p;
    if (novo === 'cancelado' && p.status !== 'cancelado') {
      p.itens.forEach(function (it) {
        var prod = produto(it.produtoId);
        if (prod) prod.estoque[p.unidadeId] = Math.round((estoqueDe(prod, p.unidadeId) + consumo(it)) * 1000) / 1000;
      });
    }
    p.status = novo;
    p.atualizadoEm = new Date().toISOString();
    save(d);
    return p;
  }

  function mensagemPedido(p) {
    var u = unidade(p.unidadeId);
    var L = [];
    L.push('🌿 *Pedido ' + p.id + ' — Manjericão ' + (u ? u.nome : '') + '*');
    L.push('');
    p.itens.forEach(function (it) {
      var q = it.tipo === 'kg' ? (it.qtd > 1 ? it.qtd + '× ' : '') + fmtPeso(it.gramas) : it.qtd + '×';
      L.push('• ' + q + ' ' + it.nome + ' — ' + fmt(it.subtotal));
    });
    L.push('');
    L.push('Subtotal: ' + fmt(p.subtotal));
    if (p.desconto) L.push('Desconto (' + p.cupom + '): −' + fmt(p.desconto));
    if (p.modalidade === 'entrega') L.push('Entrega: ' + (p.taxaEntrega ? fmt(p.taxaEntrega) : 'grátis'));
    L.push('*Total: ' + fmt(p.total) + '*');
    L.push('');
    L.push(p.modalidade === 'entrega' ? '🛵 Entrega em: ' + p.endereco : '🛍️ Retirada na loja ' + (u ? u.nome : ''));
    var pg = PAGAMENTOS.filter(function (x) { return x.id === p.pagamento; })[0];
    L.push('💳 Pagamento: ' + (pg ? pg.nome : p.pagamento));
    L.push('👤 ' + p.cliente.nome + ' · ' + fmtFone(p.cliente.whatsapp));
    if (p.obs) L.push('📝 ' + p.obs);
    return L.join('\n');
  }

  function novaCandidatura(c) {
    var d = db();
    var item = { id: uid('cand'), nome: c.nome, whatsapp: soDigitos(c.whatsapp), email: c.email || '', vaga: c.vaga, unidadeId: c.unidadeId || '', mensagem: c.mensagem || '', status: 'nova', criadoEm: new Date().toISOString(), exemplo: false };
    d.candidaturas.unshift(item);
    save(d);
    return item;
  }

  function novaNutri(n) {
    var d = db();
    var base = String(n.nome || 'NUTRI').split(' ')[0].normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, '');
    var cupom = 'NUTRI' + base, k = 2;
    while (d.nutris.some(function (x) { return x.cupom === cupom; })) cupom = 'NUTRI' + base + (k++);
    var item = { id: uid('nut'), nome: n.nome, crn: n.crn || '', whatsapp: soDigitos(n.whatsapp), instagram: n.instagram || '', cupom: cupom, desconto: 10, status: 'pendente', criadoEm: new Date().toISOString(), exemplo: false };
    d.nutris.unshift(item);
    save(d);
    return item;
  }

  function inscreverClube(dados) {
    var d = db();
    var c = upsertCliente(d, { nome: dados.nome, whatsapp: dados.whatsapp, unidadeId: dados.unidadeId, aceitaOfertas: true, origem: 'clube' });
    save(d);
    return c;
  }

  /* apaga tudo que é exemplo (para a loja começar do zero) */
  function limparExemplos() {
    var d = db();
    ['pedidos', 'clientes', 'nutris', 'candidaturas'].forEach(function (k) {
      d[k] = d[k].filter(function (x) { return !x.exemplo; });
    });
    save(d);
    return d;
  }

  window.MJ = {
    KEY: KEY, VERSION: VERSION,
    MARCA: MARCA, CATEGORIAS: CATEGORIAS, CARDAPIO_CATS: CARDAPIO_CATS, STATUS: STATUS,
    PAGAMENTOS: PAGAMENTOS, VAGAS: VAGAS, PESOS: PESOS,
    db: db, save: save, on: on, reset: reset, limparExemplos: limparExemplos,
    produto: produto, unidade: unidade, categoria: categoria, status: status,
    precoBase: precoBase, emOferta: emOferta, precoItem: precoItem,
    estoqueDe: estoqueDe, estoqueTotal: estoqueTotal, estoqueBaixo: estoqueBaixo, consumo: consumo,
    validarCupom: validarCupom, taxaEntrega: taxaEntrega, calcular: calcular,
    criarPedido: criarPedido, mudarStatus: mudarStatus, mensagemPedido: mensagemPedido,
    novaCandidatura: novaCandidatura, novaNutri: novaNutri, inscreverClube: inscreverClube,
    upsertCliente: upsertCliente,
    fmt: fmt, fmtFone: fmtFone, fmtPeso: fmtPeso, fmtData: fmtData, wa: wa, uid: uid, soDigitos: soDigitos
  };
})();
