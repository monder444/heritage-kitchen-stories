import halusky from "@/assets/recipe-halusky.jpg";
import walnut from "@/assets/recipe-walnut.jpg";
import rozky from "@/assets/recipe-rozky.jpg";
import gulas from "@/assets/recipe-gulas.jpg";
import scan from "@/assets/scan-page.jpg";

export type Recipe = {
  id: string;
  title: { sk: string; en: string };
  image: string;
  scan: string;
  era: string;
  source: { sk: string; en: string };
  region: { sk: string; en: string };
  tag: { sk: string; en: string };
  premium: boolean;
  intro: { sk: string; en: string };
  originalLines: { sk: string[]; en: string[] };
  ingredients: { sk: string[]; en: string[] };
  method: { sk: string[]; en: string[] };
};

export const recipes: Recipe[] = [
  {
    id: "halusky-1870",
    title: { sk: "Bryndzové halušky", en: "Bryndza halušky" },
    image: halusky,
    scan,
    era: "1870",
    source: {
      sk: "Babilon, J.: Prvá slovenská kuchárka v slovenskej reči (1870)",
      en: "Babilon, J.: First Slovak Cookbook in the Slovak Tongue (1870)",
    },
    region: { sk: "Liptov", en: "Liptov" },
    tag: { sk: "Regionálne špeciality", en: "Regional specialities" },
    premium: false,
    intro: {
      sk: "Pastierské jedlo z liptovských salašov — zemiaky, ovčia bryndza a kvalitná slanina.",
      en: "A shepherd's dish from Liptov highland farms — potato, ewe's bryndza and good bacon.",
    },
    originalLines: {
      sk: [
        "„Vezmi zemiakov dva libry, ošúp ich a postrúhaj na hrubom strúhadle…“",
        "„Bryndzu rozotri vidličkou s kyslým mliekom na hustú kašu…“",
      ],
      en: [
        "“Take two pounds of potatoes, peel and grate them coarsely…”",
        "“Mash the bryndza with sour milk into a thick cream…”",
      ],
    },
    ingredients: {
      sk: [
        "1 kg zemiakov (pôvodne: 2 libry)",
        "300 g pravej ovčej bryndze",
        "200 g údenej slaniny",
        "Hladká múka, soľ",
      ],
      en: [
        "1 kg potatoes (originally: 2 pounds)",
        "300 g genuine ewe's bryndza",
        "200 g smoked bacon",
        "Plain flour, salt",
      ],
    },
    method: {
      sk: [
        "Zemiaky postrúhajte najemno a zmiešajte s múkou a štipkou soli.",
        "Cesto cez sito hádžte do vriacej osolenej vody, varte 4–5 minút.",
        "Slaninu opečte, halušky scedte a premiešajte s bryndzou.",
      ],
      en: [
        "Grate the potatoes finely, mix with flour and a pinch of salt.",
        "Drop the dough through a sieve into boiling salted water; cook 4–5 minutes.",
        "Fry the bacon, drain the dumplings, fold through the bryndza.",
      ],
    },
  },
  {
    id: "rozky-1924",
    title: { sk: "Bratislavské rožky", en: "Pressburg rolls" },
    image: rozky,
    scan,
    era: "1924",
    source: {
      sk: "Archív mesta Bratislavy, Receptár cechu pekárov (1924)",
      en: "Bratislava City Archive, Bakers' Guild Recipe Book (1924)",
    },
    region: { sk: "Prešporok", en: "Pressburg" },
    tag: { sk: "Sladké pečenie", en: "Sweet baking" },
    premium: true,
    intro: {
      sk: "Polmesiace s makovou alebo orechovou plnkou — chránené zemepisné označenie EÚ.",
      en: "Crescents with poppy seed or walnut filling — an EU protected designation.",
    },
    originalLines: {
      sk: [
        "„Cesto netreba dlho hnietiť, aby ostalo krehké ako sneh na hrebeňoch Tatier.“",
        "„Plnku z mletých orechov zalej horúcim mliekom s medom…“",
      ],
      en: [
        "“Do not knead the dough too long, so it stays crisp as snow on the Tatra ridges.”",
        "“Pour hot milk with honey over the ground walnut filling…”",
      ],
    },
    ingredients: {
      sk: [
        "500 g pšeničnej múky T650",
        "250 g chladného masla",
        "2 žĺtky z domácich vajec",
        "200 g vlašských orechov, med, mlieko",
      ],
      en: [
        "500 g T650 wheat flour",
        "250 g cold butter",
        "2 yolks from free-range eggs",
        "200 g walnuts, honey, milk",
      ],
    },
    method: {
      sk: [
        "Maslo zapracujte do múky s trochou cukru a žĺtkov, cesto nechajte odpočinúť cez noc.",
        "Rozvaľkajte na obdĺžniky, naplňte orechovou plnkou a stočte do tvaru polmesiaca.",
        "Potrite žĺtkom, pečte 14 minút na 200 °C, kým sa nevytvorí mramorová kôrka.",
      ],
      en: [
        "Rub butter into flour with sugar and yolks; rest overnight.",
        "Roll into rectangles, fill with walnut paste, shape into crescents.",
        "Egg-wash and bake 14 min at 200 °C until a marbled crust forms.",
      ],
    },
  },
  {
    id: "gulas-1842",
    title: { sk: "Srnčí guláš na borievkach", en: "Venison stew with juniper" },
    image: gulas,
    scan,
    era: "1842",
    source: {
      sk: "Archív Banská Štiavnica, Poľovnícky receptár (1842)",
      en: "Banská Štiavnica Archive, Hunters' Recipe Book (1842)",
    },
    region: { sk: "Štiavnické vrchy", en: "Štiavnica Hills" },
    tag: { sk: "Mäsité jedlá", en: "Meat dishes" },
    premium: false,
    intro: {
      sk: "Tmavý guláš zo srnčieho pliecka s lesnými borievkami a starým červeným vínom.",
      en: "A dark stew of venison shoulder with forest juniper and aged red wine.",
    },
    originalLines: {
      sk: [
        "„Mäso pred varením tri dni mária v dreve borievkovom a oleji…“",
        "„Pridaj lyžicu hustého moštu zo Štiavnice pre lesk a hlbokú chuť.“",
      ],
      en: [
        "“Marinate the meat three days in juniper wood and oil…”",
        "“Add a spoon of thick Štiavnica must for shine and depth.”",
      ],
    },
    ingredients: {
      sk: [
        "1 kg srnčieho pliecka",
        "2 lyžice borievok, 2 dl červeného vína",
        "Cibuľa, slanina, rasca, bobkový list",
        "Lyžica medu",
      ],
      en: [
        "1 kg venison shoulder",
        "2 tbsp juniper berries, 200 ml red wine",
        "Onion, bacon, caraway, bay leaf",
        "1 tbsp honey",
      ],
    },
    method: {
      sk: [
        "Mäso marinujte cez noc s borievkami, vínom a olejom.",
        "Slaninu vyškvarte, opečte cibuľu, pridajte mäso a duste 2 hodiny.",
        "Zjemnite medom, dochuťte a podávajte s parenými haluškami.",
      ],
      en: [
        "Marinate the meat overnight with juniper, wine and oil.",
        "Render bacon, brown the onion, add meat and braise 2 hours.",
        "Soften with honey, season, serve with steamed dumplings.",
      ],
    },
  },
  {
    id: "zavin-1914",
    title: { sk: "Orechový závin starej mamy", en: "Grandmother's walnut roll" },
    image: walnut,
    scan,
    era: "1914",
    source: {
      sk: "Vansová, T.: Nová kuchárska kniha (1914)",
      en: "Vansová, T.: New Cookbook (1914)",
    },
    region: { sk: "Horehronie", en: "Upper Hron" },
    tag: { sk: "Sviatočné", en: "Festive" },
    premium: true,
    intro: {
      sk: "Vianočný závin s vlašskými orechmi, rozinkami a kvapkou rumu.",
      en: "A Christmas roll with walnuts, raisins and a drop of rum.",
    },
    originalLines: {
      sk: [
        "„Cesto kysnuté, mäkké jako pierko, rozvaľkaj na obrus posypaný múkou…“",
        "„Pomastíme rozpusteným maslom a posypeme orechmi s cukrom.“",
      ],
      en: [
        "“The risen dough, soft as a feather, roll out on a floured cloth…”",
        "“Brush with melted butter, sprinkle with sugared walnuts.”",
      ],
    },
    ingredients: {
      sk: [
        "500 g hladkej múky, 30 g droždia",
        "100 g masla, 80 g cukru, 2 dl mlieka",
        "300 g mletých orechov, hrsť hrozienok",
        "Lyžička rumu, žĺtok na potretie",
      ],
      en: [
        "500 g plain flour, 30 g yeast",
        "100 g butter, 80 g sugar, 200 ml milk",
        "300 g ground walnuts, a handful of raisins",
        "1 tsp rum, 1 yolk to glaze",
      ],
    },
    method: {
      sk: [
        "Pripravte kysnuté cesto, nechajte zdvojnásobiť objem.",
        "Rozvaľkajte, natrite orechovou plnkou, zrolujte a uložte do formy.",
        "Potrite žĺtkom, pečte 35 minút na 180 °C dozlatista.",
      ],
      en: [
        "Make a yeasted dough; let it double in size.",
        "Roll out, spread with walnut filling, roll up and tin.",
        "Glaze with yolk, bake 35 minutes at 180 °C until golden.",
      ],
    },
  },
];

export const dossiers = [
  {
    id: "presporok-1890",
    title: { sk: "Prešporská meštianska kuchyňa 1890", en: "Pressburg Bourgeois Kitchen 1890" },
    pages: 84,
    price: "12,00 €",
    blurb: {
      sk: "Komentovaný výber 26 receptov z mestských zbierok s historickými fotografiami.",
      en: "A curated set of 26 recipes from city collections with historical photographs.",
    },
  },
  {
    id: "liptov-pred-revoluciou",
    title: { sk: "Liptov pred priemyselnou revolúciou", en: "Liptov before the Industrial Revolution" },
    pages: 62,
    price: "9,50 €",
    blurb: {
      sk: "Pastierska a sedliacka strava, mliečne výrobky, divé byliny zo zbierok ÚĽUV.",
      en: "Shepherd and peasant fare, dairy and wild herbs from ÚĽUV collections.",
    },
  },
  {
    id: "vianoce-staromodne",
    title: { sk: "Staromódne slovenské Vianoce", en: "Old-fashioned Slovak Christmas" },
    pages: 96,
    price: "14,00 €",
    blurb: {
      sk: "Oblátky, kapustnica, pupáky a štedrovečerné zvyky troch regiónov.",
      en: "Wafers, sauerkraut soup, pupáky and Christmas Eve customs across three regions.",
    },
  },
];

export const magicPrompts = [
  {
    label: { sk: "Doporučená éra", en: "Suggested era" },
    text: {
      sk: "Čo sa varilo na nedeľný obed v Prešporku roku 1890?",
      en: "What was cooked for a Sunday lunch in Pressburg in 1890?",
    },
  },
  {
    label: { sk: "Regionálny archív", en: "Regional archive" },
    text: {
      sk: "Recept na chlieb z Liptova pred priemyselnou revolúciou.",
      en: "A bread recipe from Liptov before the Industrial Revolution.",
    },
  },
  {
    label: { sk: "Zabudnuté ingrediencie", en: "Forgotten ingredients" },
    text: {
      sk: "Ako spracovať divoký estragón podľa mníšskych záznamov?",
      en: "How to use wild tarragon, according to monastic records?",
    },
  },
];
