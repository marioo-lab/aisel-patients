import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "aisel1234";

/** Deterministic PRNG so the seeded dataset is stable across runs. */
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fmtPhone(v: string): string {
  const dg = v.replace(/\D/g, "");
  if (dg.length === 10) return `(${dg.slice(0, 3)}) ${dg.slice(3, 6)}-${dg.slice(6)}`;
  if (dg.length === 11)
    return `+${dg[0]} (${dg.slice(1, 4)}) ${dg.slice(4, 7)}-${dg.slice(7)}`;
  return v;
}

const FIRST = [
  "Olivia",
  "Liam",
  "Emma",
  "Noah",
  "Ava",
  "Mateo",
  "Sophia",
  "Ethan",
  "Isabella",
  "Lucas",
  "Mia",
  "Amir",
  "Charlotte",
  "Leo",
  "Amelia",
  "Kai",
  "Harper",
  "Ezra",
  "Aria",
  "Jonah",
  "Layla",
  "Theo",
  "Nora",
  "Idris",
  "Maya",
  "Hugo",
  "Zoe",
  "Omar",
  "Ruby",
  "Ravi",
  "Elena",
  "Marcus",
  "Priya",
  "Dylan",
  "Hana",
  "Felix",
  "Yara",
  "Soren",
  "Nina",
  "Caleb",
  "Tara",
  "Quinn",
  "Iris",
  "Diego",
  "Sana",
  "Milo",
  "Greta",
  "Andre",
  "Lena",
  "Cyrus",
  "Freya",
  "Malik",
];
const LAST = [
  "Okafor",
  "Nguyen",
  "Patel",
  "Garcia",
  "Kim",
  "Rossi",
  "Haddad",
  "Andersen",
  "Silva",
  "Chen",
  "Murphy",
  "Bauer",
  "Costa",
  "Ivanov",
  "Reyes",
  "Khan",
  "Novak",
  "Mensah",
  "Park",
  "Dubois",
  "Walsh",
  "Suzuki",
  "Romero",
  "Larsen",
  "Fischer",
  "Adeyemi",
  "Tanaka",
  "Moreau",
  "Holm",
  "Bianchi",
  "Petrov",
  "Ali",
  "Schmidt",
  "Lindqvist",
  "Owusu",
  "Cohen",
  "Vargas",
  "Yamada",
  "Brandt",
  "Saito",
  "Flores",
  "Hassan",
  "Kowalski",
  "Wagner",
  "Ortega",
  "Demir",
  "Bjork",
  "Castro",
  "Nair",
  "Ferraro",
  "Sorensen",
  "Mwangi",
];
const DOMAINS = ["gmail.com", "outlook.com", "proton.me", "aisel.health", "icloud.com"];

type SeedPatient = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: Date;
};

function generatePatients(n: number): SeedPatient[] {
  const rng = mulberry32(20260616);
  const seen = new Set<string>();
  const arr: SeedPatient[] = [];
  for (let i = 0; i < n; i++) {
    const fn = FIRST[Math.floor(rng() * FIRST.length)];
    const ln = LAST[Math.floor(rng() * LAST.length)];
    const year = 1945 + Math.floor(rng() * 62);
    const month = Math.floor(rng() * 12);
    const day = 1 + Math.floor(rng() * 28);
    const dg =
      "" +
      (200 + Math.floor(rng() * 799)) +
      (200 + Math.floor(rng() * 799)) +
      String(1000 + Math.floor(rng() * 8999));
    let email =
      `${fn}.${ln}`.toLowerCase() +
      (rng() < 0.3 ? Math.floor(rng() * 90 + 10) : "") +
      "@" +
      DOMAINS[Math.floor(rng() * DOMAINS.length)];
    // Patient.email is unique — disambiguate the rare collision.
    if (seen.has(email)) {
      const [local, domain] = email.split("@");
      email = `${local}.${i}@${domain}`;
    }
    seen.add(email);
    arr.push({
      firstName: fn,
      lastName: ln,
      email,
      phoneNumber: fmtPhone(dg),
      dob: new Date(Date.UTC(year, month, day)),
    });
  }
  return arr;
}

async function main() {
  const passwordHash = await hash(DEMO_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@aisel.health" },
    update: { name: "Dr. Mara Ellison", role: Role.admin, passwordHash },
    create: {
      email: "admin@aisel.health",
      name: "Dr. Mara Ellison",
      role: Role.admin,
      passwordHash,
    },
  });

  await prisma.user.upsert({
    where: { email: "user@aisel.health" },
    update: { name: "Jordan Lee", role: Role.user, passwordHash },
    create: {
      email: "user@aisel.health",
      name: "Jordan Lee",
      role: Role.user,
      passwordHash,
    },
  });

  // Reset patients so the deterministic dataset is reproducible.
  await prisma.patient.deleteMany();
  const patients = generatePatients(52).map((p) => ({
    ...p,
    createdById: admin.id,
  }));
  await prisma.patient.createMany({ data: patients });

  console.log(
    `Seeded 2 users (password "${DEMO_PASSWORD}") and ${patients.length} patients.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
