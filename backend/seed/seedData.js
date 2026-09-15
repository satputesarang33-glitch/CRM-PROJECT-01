import { db, auth, FieldValue } from "../config/firebase.js";

/**
 * CRM Seed Script
 * Generates initial demo users, customers, leads, deals, tasks, activities, and tickets.
 *
 * Usage:
 * npm run seed
 */

const DEMO_USERS = [
  {
    uid: "admin_user_001",
    email: "admin@crmdemo.com",
    password: "Password123!",
    firstName: "Sarah",
    lastName: "Connor",
    phone: "+1-555-0100",
    role: "Admin",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  },
  {
    uid: "manager_user_002",
    email: "manager@crmdemo.com",
    password: "Password123!",
    firstName: "Michael",
    lastName: "Scott",
    phone: "+1-555-0101",
    role: "Manager",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
  },
  {
    uid: "sales_user_003",
    email: "sales@crmdemo.com",
    password: "Password123!",
    firstName: "Jim",
    lastName: "Halpert",
    phone: "+1-555-0102",
    role: "Sales Agent",
    profileImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
  },
  {
    uid: "support_user_004",
    email: "support@crmdemo.com",
    password: "Password123!",
    firstName: "Pam",
    lastName: "Beesly",
    phone: "+1-555-0103",
    role: "Support Agent",
    profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
  },
];

const DEMO_CUSTOMERS = [
  {
    firstName: "Alice",
    lastName: "Smith",
    email: "alice@acme.com",
    phone: "+1-555-0201",
    company: "Acme Innovations Inc",
    jobTitle: "Chief Technology Officer",
    city: "San Francisco",
    state: "CA",
    country: "USA",
    website: "https://acme.example.com",
    source: "Referral",
    status: "Active",
    notes: "Key enterprise client with 500+ seats.",
  },
  {
    firstName: "Robert",
    lastName: "Johnson",
    email: "robert@vertex.io",
    phone: "+1-555-0202",
    company: "Vertex Data Labs",
    jobTitle: "VP of Operations",
    city: "Austin",
    state: "TX",
    country: "USA",
    website: "https://vertex.example.com",
    source: "Conference",
    status: "Prospect",
    notes: "Interested in Q4 cloud migration bundle.",
  },
  {
    firstName: "Elena",
    lastName: "Rostova",
    email: "elena@nordictech.eu",
    phone: "+44-20-7946-0192",
    company: "Nordic Dynamics",
    jobTitle: "Head of Procurement",
    city: "Stockholm",
    country: "Sweden",
    source: "Inbound",
    status: "Customer",
    notes: "Renewed annual contract with SLA support tier.",
  },
];

const DEMO_LEADS = [
  {
    name: "David Kim",
    email: "david.kim@fintechplus.com",
    phone: "+1-555-0301",
    company: "FinTech Plus",
    source: "Google Ads",
    status: "Qualified",
    priority: "High",
    expectedValue: 45000,
    notes: "Looking to replace legacy CRM before fiscal year end.",
  },
  {
    name: "Jessica Taylor",
    email: "jessica@healthpulse.org",
    phone: "+1-555-0302",
    company: "HealthPulse Global",
    source: "Webinar",
    status: "Proposal",
    priority: "Medium",
    expectedValue: 28000,
    notes: "Requested detailed security compliance checklist.",
  },
  {
    name: "Marcus Aurel",
    email: "marcus@solarsystems.com",
    phone: "+1-555-0303",
    company: "SolarSystems Clean Energy",
    source: "Direct",
    status: "New",
    priority: "Low",
    expectedValue: 12500,
    notes: "Initial inquiry submitted through contact form.",
  },
];

async function seedDatabase() {
  console.log("🌱 Starting CRM Database Seeding...");

  try {
    const timestamp = FieldValue.serverTimestamp();

    // 1. Seed Users (Auth + Firestore)
    console.log("👤 Seeding Demo Users...");
    for (const user of DEMO_USERS) {
      let uid = user.uid;

      // Attempt to create in Firebase Auth
      try {
        const authUser = await auth.createUser({
          uid: user.uid,
          email: user.email,
          password: user.password,
          displayName: `${user.firstName} ${user.lastName}`,
        });
        uid = authUser.uid;
        console.log(`  ✅ Created Firebase Auth user: ${user.email}`);
      } catch (authErr) {
        if (authErr.code === "auth/uid-already-exists" || authErr.code === "auth/email-already-exists") {
          console.log(`  ℹ️ Auth user ${user.email} already exists.`);
        } else {
          console.warn(`  ⚠️ Auth creation error for ${user.email}:`, authErr.message);
        }
      }

      // Upsert profile in Firestore 'users' collection
      await db.collection("users").doc(uid).set(
        {
          uid,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          profileImage: user.profileImage,
          isActive: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        { merge: true }
      );
    }

    const salesRepId = "sales_user_003";
    const supportAgentId = "support_user_004";

    // 2. Seed Customers
    console.log("🏢 Seeding Customers...");
    const createdCustomerIds = [];
    for (const cust of DEMO_CUSTOMERS) {
      const docRef = await db.collection("customers").add({
        ...cust,
        assignedEmployee: salesRepId,
        createdBy: "admin_user_001",
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      createdCustomerIds.push(docRef.id);
    }

    // 3. Seed Leads
    console.log("🎯 Seeding Leads...");
    for (const lead of DEMO_LEADS) {
      await db.collection("leads").add({
        ...lead,
        assignedUser: salesRepId,
        createdBy: "admin_user_001",
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    // 4. Seed Deals
    console.log("💼 Seeding Deals...");
    if (createdCustomerIds.length > 0) {
      const demoDeals = [
        {
          dealName: "Acme Annual Enterprise License",
          customerId: createdCustomerIds[0],
          value: 65000,
          stage: "Won",
          probability: 100,
          expectedCloseDate: new Date(),
          assignedSalesperson: salesRepId,
          notes: "Closed 3-year term deal with full support SLA.",
        },
        {
          dealName: "Vertex Cloud Onboarding Package",
          customerId: createdCustomerIds[1] || createdCustomerIds[0],
          value: 32000,
          stage: "Negotiation",
          probability: 80,
          expectedCloseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
          assignedSalesperson: salesRepId,
          notes: "Legal reviewing privacy addendum.",
        },
        {
          dealName: "Nordic Expansion Add-on",
          customerId: createdCustomerIds[2] || createdCustomerIds[0],
          value: 18500,
          stage: "Proposal",
          probability: 50,
          expectedCloseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          assignedSalesperson: salesRepId,
          notes: "Demo delivered to European division.",
        },
      ];

      for (const deal of demoDeals) {
        await db.collection("deals").add({
          ...deal,
          createdBy: salesRepId,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      }
    }

    // 5. Seed Tasks
    console.log("📋 Seeding Tasks...");
    const demoTasks = [
      {
        title: "Send revised proposal to Vertex Data Labs",
        description: "Include discounted multi-region hosting tier.",
        assignedUser: salesRepId,
        customerId: createdCustomerIds[1] || "",
        priority: "High",
        status: "Pending",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      },
      {
        title: "Conduct quarterly customer review with Acme",
        description: "Review system usage KPIs and feature requests.",
        assignedUser: salesRepId,
        customerId: createdCustomerIds[0] || "",
        priority: "Medium",
        status: "In Progress",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      },
      {
        title: "Follow up on onboarding feedback",
        description: "Check in on user adoption.",
        assignedUser: salesRepId,
        customerId: createdCustomerIds[0] || "",
        priority: "Low",
        status: "Completed",
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      },
    ];

    for (const task of demoTasks) {
      await db.collection("tasks").add({
        ...task,
        createdBy: "admin_user_001",
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    // 6. Seed Activities
    console.log("📞 Seeding Activities...");
    if (createdCustomerIds.length > 0) {
      await db.collection("activities").add({
        type: "Call",
        subject: "Executive Alignment Call",
        description: "Discussed deployment schedule and training workshops.",
        customerId: createdCustomerIds[0],
        userId: salesRepId,
        activityDate: new Date().toISOString(),
        createdAt: timestamp,
      });

      await db.collection("activities").add({
        type: "Meeting",
        subject: "Product Demo & Q&A Session",
        description: "Walked team through new CRM automation pipelines.",
        customerId: createdCustomerIds[1] || createdCustomerIds[0],
        userId: salesRepId,
        activityDate: new Date().toISOString(),
        createdAt: timestamp,
      });
    }

    // 7. Seed Support Tickets
    console.log("🎫 Seeding Tickets...");
    if (createdCustomerIds.length > 0) {
      await db.collection("tickets").add({
        ticketId: "TICK-102941",
        customerId: createdCustomerIds[0],
        subject: "SSO Integration SAML Configuration Assistance",
        description: "Client needs help verifying assertion consumer service URL.",
        priority: "High",
        status: "In Progress",
        assignedAgent: supportAgentId,
        createdBy: "admin_user_001",
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      await db.collection("tickets").add({
        ticketId: "TICK-102942",
        customerId: createdCustomerIds[2] || createdCustomerIds[0],
        subject: "Invoice receipt copy for Q2",
        description: "Accounting requires PDF copy of June invoice.",
        priority: "Low",
        status: "Resolved",
        assignedAgent: supportAgentId,
        createdBy: salesRepId,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    // 8. Seed Notifications
    console.log("🔔 Seeding Notifications...");
    await db.collection("notifications").add({
      userId: salesRepId,
      type: "NEW_LEAD",
      title: "New High-Priority Lead",
      message: "Lead David Kim (FinTech Plus) has been assigned to you.",
      relatedId: "",
      isRead: false,
      createdAt: timestamp,
    });

    await db.collection("notifications").add({
      userId: "ALL",
      type: "DEAL_WON",
      title: "🎉 Acme Deal Won!",
      message: "Sarah Connor & Jim Halpert closed the Acme Enterprise contract ($65,000)!",
      relatedId: "",
      isRead: false,
      createdAt: timestamp,
    });

    console.log("✨ Seed completed successfully! All CRM collections populated.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase();
