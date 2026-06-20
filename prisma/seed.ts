import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CITATION_DIRECTORIES = [
  { name: "Yelp", url: "https://yelp.com", submissionType: "api", category: "general", priority: 1, domainAuthority: 93 },
  { name: "Yellow Pages", url: "https://yellowpages.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 86 },
  { name: "Bing Places", url: "https://bingplaces.com", submissionType: "api", category: "general", priority: 1, domainAuthority: 94 },
  { name: "Apple Maps", url: "https://mapsconnect.apple.com", submissionType: "api", category: "general", priority: 1, domainAuthority: 96 },
  { name: "Foursquare", url: "https://foursquare.com", submissionType: "api", category: "general", priority: 1, domainAuthority: 92 },
  { name: "Facebook Business", url: "https://facebook.com/business", submissionType: "form", category: "general", priority: 1, domainAuthority: 96 },
  { name: "BBB", url: "https://bbb.org", submissionType: "form", category: "general", priority: 1, domainAuthority: 91 },
  { name: "Angi", url: "https://angi.com", submissionType: "form", category: "home_services", priority: 1, domainAuthority: 87 },
  { name: "HomeAdvisor", url: "https://homeadvisor.com", submissionType: "form", category: "home_services", priority: 1, domainAuthority: 85 },
  { name: "TripAdvisor", url: "https://tripadvisor.com", submissionType: "form", category: "restaurant", priority: 1, domainAuthority: 93 },
  { name: "Thumbtack", url: "https://thumbtack.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 82 },
  { name: "Alignable", url: "https://alignable.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 67 },
  { name: "Merchant Circle", url: "https://merchantcircle.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 74 },
  { name: "Manta", url: "https://manta.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 72 },
  { name: "Citysearch", url: "https://citysearch.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 70 },
  { name: "Superpages", url: "https://superpages.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 74 },
  { name: "Whitepages", url: "https://whitepages.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 80 },
  { name: "MapQuest", url: "https://mapquest.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 85 },
  { name: "Chamber of Commerce", url: "https://chamberofcommerce.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 68 },
  { name: "Nextdoor Business", url: "https://nextdoor.com/business", submissionType: "form", category: "general", priority: 1, domainAuthority: 82 },
  { name: "Hotfrog", url: "https://hotfrog.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 60 },
  { name: "ezlocal", url: "https://ezlocal.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 53 },
  { name: "BrownBook", url: "https://brownbook.net", submissionType: "form", category: "general", priority: 1, domainAuthority: 55 },
  { name: "2FindLocal", url: "https://2findlocal.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 47 },
  { name: "LocalStack", url: "https://localstack.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 40 },
  { name: "n49", url: "https://n49.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 42 },
  { name: "Cylex", url: "https://cylex.us.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 58 },
  { name: "Fyple", url: "https://fyple.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 46 },
  { name: "GetFave", url: "https://getfave.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 44 },
  { name: "GoLocal247", url: "https://golocal247.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 41 },
  { name: "iGlobal", url: "https://iglobal.co", submissionType: "form", category: "general", priority: 1, domainAuthority: 39 },
  { name: "Infobel", url: "https://infobel.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 55 },
  { name: "InsiderPages", url: "https://insiderpages.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 65 },
  { name: "LocalDatabase", url: "https://localdatabase.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 38 },
  { name: "MojoPages", url: "https://mojopages.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 41 },
  { name: "MyHuckleberry", url: "https://myhuckleberry.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 36 },
  { name: "Opendi", url: "https://opendi.us", submissionType: "form", category: "general", priority: 1, domainAuthority: 44 },
  { name: "ShowMeLocal", url: "https://showmelocal.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 50 },
  { name: "SureCritic", url: "https://surecritic.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 43 },
  { name: "Tuugo", url: "https://tuugo.us", submissionType: "form", category: "general", priority: 1, domainAuthority: 40 },
  { name: "USCity.net", url: "https://uscity.net", submissionType: "form", category: "general", priority: 1, domainAuthority: 45 },
  { name: "WhereTo", url: "https://whereto.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 37 },
  { name: "YellowMoxie", url: "https://yellowmoxie.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 42 },
  { name: "YellowBot", url: "https://yellowbot.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 55 },
  { name: "YP.com", url: "https://yp.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 82 },
  { name: "ZipLeaf", url: "https://zipleaf.com", submissionType: "form", category: "general", priority: 1, domainAuthority: 44 },
  // Niche: Medical
  { name: "Healthgrades", url: "https://healthgrades.com", submissionType: "form", category: "medical", priority: 2, domainAuthority: 83 },
  { name: "ZocDoc", url: "https://zocdoc.com", submissionType: "form", category: "medical", priority: 2, domainAuthority: 79 },
  { name: "Vitals", url: "https://vitals.com", submissionType: "form", category: "medical", priority: 2, domainAuthority: 72 },
  { name: "WebMD", url: "https://webmd.com", submissionType: "manual", category: "medical", priority: 2, domainAuthority: 91 },
  // Niche: Legal
  { name: "Avvo", url: "https://avvo.com", submissionType: "form", category: "legal", priority: 2, domainAuthority: 80 },
  { name: "FindLaw", url: "https://findlaw.com", submissionType: "form", category: "legal", priority: 2, domainAuthority: 86 },
];

async function main() {
  console.log("Seeding citation directories...");

  for (const dir of CITATION_DIRECTORIES) {
    await prisma.citationDirectory.upsert({
      where: { id: (await prisma.citationDirectory.findFirst({ where: { name: dir.name } }))?.id ?? "new" },
      create: dir,
      update: dir,
    });
  }

  console.log(`Seeded ${CITATION_DIRECTORIES.length} citation directories.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
