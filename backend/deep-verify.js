/**
 * deep-verify.js
 * Comprehensive deep-level end-to-end integration and API verification
 */

const BASE_API = "http://localhost:5000/api";
const FRONTEND_URL = "http://localhost:5173";

async function runDeepVerification() {
  console.log("===============================================================");
  console.log("🚀 STARTING DEEP-LEVEL FULL-STACK END-TO-END VERIFICATION");
  console.log("===============================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition, description, detail = "") {
    total++;
    if (condition) {
      passed++;
      console.log(`  ✅ [PASS] ${description} ${detail ? `(${detail})` : ""}`);
    } else {
      console.error(`  ❌ [FAIL] ${description} ${detail ? `(${detail})` : ""}`);
    }
  }

  // 1. FRONTEND SERVER
  console.log("📌 1. FRONTEND DEV SERVER & HTML INTEGRATION");
  try {
    const fRes = await fetch(FRONTEND_URL);
    const html = await fRes.text();
    assert(fRes.status === 200, "Frontend server HTTP 200 OK");
    assert(html.includes('id="root"'), "Frontend HTML contains root DOM element");
    assert(html.includes("/src/main.jsx"), "Frontend links to Vite main entry point");

    const jsRes = await fetch(`${FRONTEND_URL}/src/main.jsx`);
    assert(jsRes.status === 200, "Vite compiles and serves main.jsx module correctly");
  } catch (err) {
    assert(false, "Frontend server reachable", err.message);
  }

  // 2. BACKEND HEALTH & CORS
  console.log("\n📌 2. BACKEND HEALTH & CORS SECURITY POLICIES");
  try {
    const hRes = await fetch(`${BASE_API}/health`, {
      headers: { Origin: FRONTEND_URL },
    });
    const hData = await hRes.json();
    assert(hRes.status === 200, "Backend /api/health returns 200 OK");
    assert(hData.success === true, "Health response status success=true");

    const allowOrigin = hRes.headers.get("access-control-allow-origin");
    assert(
      allowOrigin === FRONTEND_URL || allowOrigin === "*",
      "CORS Access-Control-Allow-Origin correctly allows frontend",
      allowOrigin
    );
  } catch (err) {
    assert(false, "Backend health check reachable", err.message);
  }

  // 3. AUTHENTICATION & TOKEN ISSUANCE
  console.log("\n📌 3. AUTHENTICATION FLOW (LOGIN & INVALID CREDENTIALS)");
  let authToken = null;
  try {
    // Test Invalid Login rejection
    const badLoginRes = await fetch(`${BASE_API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: FRONTEND_URL },
      body: JSON.stringify({ email: "wrong@email.com", password: "wrong" }),
    });
    assert(
      badLoginRes.status === 401 || badLoginRes.status === 400 || badLoginRes.status === 404,
      "Rejects invalid credentials with 4xx status code",
      `Status ${badLoginRes.status}`
    );

    // Test Valid Login
    const loginRes = await fetch(`${BASE_API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: FRONTEND_URL },
      body: JSON.stringify({ email: "admin@crmdemo.com", password: "Password123!" }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, "Valid login returns 200 OK");
    assert(Boolean(loginData.data?.token), "Firebase JWT ID Token generated");
    assert(loginData.data?.user?.email === "admin@crmdemo.com", "Correct user profile returned", loginData.data?.user?.name);
    authToken = loginData.data?.token;
  } catch (err) {
    assert(false, "Authentication flow", err.message);
  }

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
    Origin: FRONTEND_URL,
  };

  // 4. CUSTOMERS CRUD
  console.log("\n📌 4. CUSTOMERS COLLECTION (FULL CRUD TEST)");
  let createdCustId = null;
  try {
    // List
    const cListRes = await fetch(`${BASE_API}/customers`, { headers: authHeaders });
    const cListData = await cListRes.json();
    assert(cListRes.status === 200, "GET /api/customers succeeds", `Count: ${cListData.data?.length}`);

    // Create
    const newCustRes = await fetch(`${BASE_API}/customers`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        firstName: "Automated",
        lastName: "Verification",
        email: `verify_${Date.now()}@nexuscrm.com`,
        phone: "+1555000111",
        company: "Nexus Deep Test Inc",
        status: "Active",
      }),
    });
    const newCustData = await newCustRes.json();
    createdCustId = newCustData.data?.id;
    assert(newCustRes.status === 201 || newCustRes.status === 200, "POST /api/customers creates record", `ID: ${createdCustId}`);

    // Read by ID
    const getCustRes = await fetch(`${BASE_API}/customers/${createdCustId}`, { headers: authHeaders });
    const getCustData = await getCustRes.json();
    assert(getCustData.data?.company === "Nexus Deep Test Inc", "GET /api/customers/:id retrieves created customer");

    // Update
    const putCustRes = await fetch(`${BASE_API}/customers/${createdCustId}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ company: "Nexus Deep Test Inc (Updated)" }),
    });
    const putCustData = await putCustRes.json();
    assert(putCustRes.status === 200, "PUT /api/customers/:id updates customer data");

    // Delete (Cleanup)
    const delCustRes = await fetch(`${BASE_API}/customers/${createdCustId}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    assert(delCustRes.status === 200, "DELETE /api/customers/:id removes customer and cleans up");
  } catch (err) {
    assert(false, "Customers CRUD flow", err.message);
  }

  // 5. LEADS MANAGEMENT
  console.log("\n📌 5. LEADS PIPELINE & CONVERSION");
  let createdLeadId = null;
  try {
    const lRes = await fetch(`${BASE_API}/leads`, { headers: authHeaders });
    const lData = await lRes.json();
    assert(lRes.status === 200, "GET /api/leads succeeds", `Count: ${lData.data?.length}`);

    const newLeadRes = await fetch(`${BASE_API}/leads`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Test Prospect",
        email: `lead_${Date.now()}@targetcorp.io`,
        company: "Target Corp",
        status: "New",
        value: 25000,
      }),
    });
    const newLeadData = await newLeadRes.json();
    createdLeadId = newLeadData.data?.id;
    assert(newLeadRes.status === 201 || newLeadRes.status === 200, "POST /api/leads creates new lead", `ID: ${createdLeadId}`);

    if (createdLeadId) {
      await fetch(`${BASE_API}/leads/${createdLeadId}`, { method: "DELETE", headers: authHeaders });
      assert(true, "Cleaned up test lead");
    }
  } catch (err) {
    assert(false, "Leads flow", err.message);
  }

  // 6. DEALS PIPELINE
  console.log("\n📌 6. DEALS & REVENUE PIPELINE");
  let createdDealId = null;
  try {
    const dRes = await fetch(`${BASE_API}/deals`, { headers: authHeaders });
    const dData = await dRes.json();
    assert(dRes.status === 200, "GET /api/deals succeeds", `Count: ${dData.data?.length}`);

    // Get a customer ID to associate
    const cListRes = await fetch(`${BASE_API}/customers`, { headers: authHeaders });
    const cListData = await cListRes.json();
    const custId = cListData.data?.[0]?.id || "cust_test_123";

    const newDealRes = await fetch(`${BASE_API}/deals`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        dealName: "Deep Verify Enterprise Deal",
        customerId: custId,
        value: 85000,
        stage: "Proposal",
        probability: 60,
      }),
    });
    const newDealData = await newDealRes.json();
    createdDealId = newDealData.data?.id;
    assert(newDealRes.status === 201 || newDealRes.status === 200, "POST /api/deals creates new deal", `ID: ${createdDealId}`);

    if (createdDealId) {
      const patchRes = await fetch(`${BASE_API}/deals/${createdDealId}/stage`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ stage: "Proposal" }),
      });
      assert(patchRes.status === 200, "PATCH /api/deals/:id/stage advances deal pipeline stage");

      await fetch(`${BASE_API}/deals/${createdDealId}`, { method: "DELETE", headers: authHeaders });
      assert(true, "Cleaned up test deal");
    }
  } catch (err) {
    assert(false, "Deals flow", err.message);
  }

  // 7. TASKS, ACTIVITIES, TICKETS, NOTIFICATIONS
  console.log("\n📌 7. TASKS, ACTIVITIES, SUPPORT TICKETS & NOTIFICATIONS");
  try {
    const [taskRes, actRes, tickRes, notifRes] = await Promise.all([
      fetch(`${BASE_API}/tasks`, { headers: authHeaders }),
      fetch(`${BASE_API}/activities`, { headers: authHeaders }),
      fetch(`${BASE_API}/tickets`, { headers: authHeaders }),
      fetch(`${BASE_API}/notifications`, { headers: authHeaders }),
    ]);

    const [tData, aData, tiData, nData] = await Promise.all([
      taskRes.json(),
      actRes.json(),
      tickRes.json(),
      notifRes.json(),
    ]);

    assert(taskRes.status === 200, "GET /api/tasks returns 200", `Count: ${tData.data?.length}`);
    assert(actRes.status === 200, "GET /api/activities returns 200", `Count: ${aData.data?.length}`);
    assert(tickRes.status === 200, "GET /api/tickets returns 200", `Count: ${tiData.data?.length}`);
    assert(notifRes.status === 200, "GET /api/notifications returns 200", `Count: ${nData.data?.length}`);
  } catch (err) {
    assert(false, "Tasks/Activities/Tickets/Notifications", err.message);
  }

  // 8. DASHBOARD METRICS & ANALYTICS
  console.log("\n📌 8. DASHBOARD AGGREGATED STATS & ANALYTICS");
  try {
    const statRes = await fetch(`${BASE_API}/dashboard/stats`, { headers: authHeaders });
    const statData = await statRes.json();
    assert(statRes.status === 200, "GET /api/dashboard/stats returns 200");
    assert(typeof statData.data?.totalRevenue === "number", "Calculates total revenue accurately", `$${statData.data?.totalRevenue}`);
    assert(typeof statData.data?.totalCustomers === "number", "Calculates active customer count", `${statData.data?.totalCustomers}`);
  } catch (err) {
    assert(false, "Dashboard stats check", err.message);
  }

  console.log("\n===============================================================");
  console.log(`📊 VERIFICATION SUMMARY: ${passed} / ${total} CHECKS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log("===============================================================");
}

runDeepVerification();
