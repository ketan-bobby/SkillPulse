import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function createSampleEmployees() {
  try {
    // Create sample employees with different roles
    const employees = [
      {
        username: "john.smith",
        password: "password123", // Will be hashed by auth system
        role: "employee",
        name: "John Smith",
        email: "john.smith@techcorp.com",
        employeeId: "EMP001",
        position: "senior",
        domain: "programming",
        skills: ["JavaScript", "React", "Node.js", "TypeScript"],
        certifications: ["AWS Developer", "React Professional"],
        experience: 5,
        location: "Remote",
        workType: "full_time"
      },
      {
        username: "sarah.dev",
        password: "password123",
        role: "employee",
        name: "Sarah Developer",
        email: "sarah.dev@techcorp.com",
        employeeId: "EMP002",
        position: "mid",
        domain: "frontend",
        skills: ["React", "Vue.js", "CSS", "UI/UX"],
        certifications: ["Frontend Masters", "Google UX Design"],
        experience: 3,
        location: "New York",
        workType: "full_time"
      },
      {
        username: "mike.ops",
        password: "password123",
        role: "team_lead",
        name: "Mike Operations",
        email: "mike.ops@techcorp.com",
        employeeId: "EMP003",
        position: "lead",
        domain: "devops",
        skills: ["Docker", "Kubernetes", "AWS", "Jenkins"],
        certifications: ["AWS Solutions Architect", "Kubernetes Administrator"],
        experience: 8,
        location: "San Francisco",
        workType: "full_time"
      },
      {
        username: "admin",
        password: "password123",
        role: "admin",
        name: "System Administrator",
        email: "admin@techcorp.com",
        employeeId: "ADM001",
        position: "principal",
        domain: "programming",
        skills: ["System Administration", "Database Management", "Security"],
        certifications: ["CISSP", "CompTIA Security+"],
        experience: 10,
        location: "Remote",
        workType: "full_time"
      },
      {
        username: "superadmin",
        password: "password123",
        role: "super_admin",
        name: "Super Administrator",
        email: "superadmin@techcorp.com",
        employeeId: "SADM001",
        position: "principal",
        domain: "programming",
        skills: ["System Architecture", "Platform Management", "Enterprise Security"],
        certifications: ["CISSP", "TOGAF", "AWS Solutions Architect"],
        experience: 15,
        location: "Remote",
        workType: "full_time"
      }
    ];

    const createdEmployees = [];
    for (const employee of employees) {
      try {
        const existing = await storage.getUserByUsername(employee.username);
        if (!existing) {
          // Hash the password before creating user
          const hashedPassword = await hashPassword(employee.password);
          const employeeWithHashedPassword = { ...employee, password: hashedPassword };
          
          const created = await storage.createUser(employeeWithHashedPassword as any);
          createdEmployees.push(created);
          console.log(`Created employee: ${employee.name} (${employee.username})`);
        } else {
          console.log(`Employee already exists: ${employee.username}`);
        }
      } catch (error) {
        console.error(`Error creating employee ${employee.username}:`, error);
      }
    }

    return createdEmployees;
  } catch (error) {
    console.error("Error creating sample employees:", error);
    throw error;
  }
}