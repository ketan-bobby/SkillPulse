import { storage } from "./storage";

export async function createSampleCompanies() {
  try {
    const companies = [
      {
        name: "TechCorp Solutions",
        code: "TECH001",
        legalName: "TechCorp Solutions LLC",
        industry: "Software Development",
        size: "mid_size", 
        location: "San Francisco, CA",
        website: "https://techcorp.com",
        description: "Leading software development company specializing in enterprise solutions",
        status: "active",
        tradingAs: "TechCorp"
      },
      {
        name: "Innovation Labs", 
        code: "INNOV001",
        legalName: "Innovation Labs Inc",
        industry: "Technology",
        size: "startup",
        location: "Austin, TX", 
        website: "https://innovationlabs.io",
        description: "Cutting-edge technology startup focused on AI and machine learning",
        status: "active",
        tradingAs: "InnLabs"
      },
      {
        name: "Global Systems Inc",
        code: "GSI001",
        legalName: "Global Systems Incorporated",
        industry: "Enterprise Software",
        size: "large",
        location: "New York, NY",
        website: "https://globalsystems.com", 
        description: "Fortune 500 company providing enterprise software solutions",
        status: "active",
        tradingAs: "GSI"
      }
    ];

    const createdCompanies = [];
    for (const company of companies) {
      try {
        const existing = await storage.getCompanies();
        const existingCompany = existing.find(c => c.name === company.name);
        
        if (!existingCompany) {
          const created = await storage.createCompany(company);
          createdCompanies.push(created);
          console.log(`Created company: ${company.name}`);
        } else {
          console.log(`Company already exists: ${company.name}`);
        }
      } catch (error) {
        console.error(`Error creating company ${company.name}:`, error);
      }
    }

    return createdCompanies;
  } catch (error) {
    console.error("Error creating sample companies:", error);
    throw error;
  }
}

export async function createSampleDepartments() {
  try {
    const companies = await storage.getCompanies();
    if (companies.length === 0) {
      console.log("No companies found, creating companies first");
      await createSampleCompanies();
    }

    const departments = [
      {
        name: "Engineering",
        code: "ENG001",
        description: "Software development and engineering team",
        companyId: companies[0]?.id || 1,
        headOfDepartment: "Jane Doe"
      },
      {
        name: "Quality Assurance", 
        code: "QA001",
        description: "Testing and quality assurance team",
        companyId: companies[0]?.id || 1,
        headOfDepartment: "Bob Smith"
      },
      {
        name: "DevOps",
        code: "DEVOPS001",
        description: "Infrastructure and deployment team", 
        companyId: companies[0]?.id || 1,
        headOfDepartment: "Alice Johnson"
      }
    ];

    const createdDepartments = [];
    for (const department of departments) {
      try {
        const existing = await storage.getDepartments();
        const existingDept = existing.find(d => d.name === department.name && d.companyId === department.companyId);
        
        if (!existingDept) {
          const created = await storage.createDepartment(department);
          createdDepartments.push(created);
          console.log(`Created department: ${department.name}`);
        } else {
          console.log(`Department already exists: ${department.name}`);
        }
      } catch (error) {
        console.error(`Error creating department ${department.name}:`, error);
      }
    }

    return createdDepartments;
  } catch (error) {
    console.error("Error creating sample departments:", error);
    throw error;
  }
}