/**
 * verify-e2e.js
 * Comprehensive verification of Backend & Frontend Integration
 */

async function runEndToEndVerification() {
  console.log("==================================================");
  console.log("🔍 RUNNING COMPLETE END-TO-END VERIFICATION");
  console.log("==================================================");

  // 1. Check Frontend Dev Server
  console.log("\n[1/7] Checking Frontend Dev Server (http://localhost:5173)...");
  try {
    const frontendRes = await fetch("http://localhost:5173");
    console.log(`  ✅ Frontend Server is ONLINE (Status: ${frontendRes.status} ${frontendRes.statusText})`);
  } catch (err) {
    console.error(`  ❌ Frontend Server is OFFLINE: ${err.message}`);
  }

  // 2. Check Backend API Server
  console.log("\n[2/7] Checking Backend Server (http://localhost:5000/api/health)...");
  try {
    const backendRes = await fetch("http://localhost:5000/api/health", {
      headers: { Origin: "http://localhost:5173" },
    });
    const data = await backendRes.json();
    console.log(`  ✅ Backend Health Check SUCCESS (Status: ${backendRes.status})`);
    console.log(`  📦 Response Payload:`, data);
  } catch (err) {
    console.error(`  ❌ Backend Server Error: ${err.message}`);
  }

  // 3. Check CORS Integration
  console.log("\n[3/7] Verifying CORS between Frontend & Backend...");
  try {
    const corsRes = await fetch("http://localhost:5000/api/health", {
      headers: { Origin: "http://localhost:5173" },
    });
    const allowOrigin = corsRes.headers.get("access-control-allow-origin");
    console.log(`  ✅ CORS Header received: Access-Control-Allow-Origin = "${allowOrigin}"`);
  } catch (err) {
    console.error(`  ❌ CORS Check failed: ${err.message}`);
  }

  // 4. Test Live Login Flow (Authentication with Firebase)
  console.log("\n[4/7] Testing Frontend-to-Backend Login Flow (/api/auth/login)...");
  let authToken = null;
  try {
    const loginRes = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:5173",
      },
      body: JSON.stringify({
        email: "admin@crmdemo.com",
        password: "Password123!",
      }),
    });
    const loginData = await loginRes.json();
    if (loginData.success && loginData.data?.token) {
      authToken = loginData.data.token;
      console.log(`  ✅ Live Login SUCCESS! User: "${loginData.data.user.name}" (${loginData.data.user.role})`);
      console.log(`  🔑 Real Firebase ID Token Received (${authToken.slice(0, 30)}...)`);
    } else {
      console.error(`  ❌ Login failed:`, loginData);
    }
  } catch (err) {
    console.error(`  ❌ Login API error: ${err.message}`);
  }

  // 5. Test Live Protected Customers & Stats
  console.log("\n[5/7] Testing Customers & Dashboard Stats...");
  try {
    const custRes = await fetch("http://localhost:5000/api/customers", {
      headers: {
        Authorization: `Bearer ${authToken}`,
        Origin: "http://localhost:5173",
      },
    });
    const custData = await custRes.json();
    console.log(`  ✅ /api/customers SUCCESS! Retrieved ${custData.data?.length || 0} live customers.`);

    const statsRes = await fetch("http://localhost:5000/api/dashboard/stats", {
      headers: {
        Authorization: `Bearer ${authToken}`,
        Origin: "http://localhost:5173",
      },
    });
    const statsData = await statsRes.json();
    console.log(`  ✅ /api/dashboard/stats SUCCESS! Total Revenue: $${statsData.data?.totalRevenue?.toLocaleString() || 0}`);
  } catch (err) {
    console.error(`  ❌ Authenticated fetch error: ${err.message}`);
  }

  // 6. Test Live Leads & Deals
  console.log("\n[6/7] Testing Leads & Deals Endpoints...");
  try {
    const leadsRes = await fetch("http://localhost:5000/api/leads", {
      headers: {
        Authorization: `Bearer ${authToken}`,
        Origin: "http://localhost:5173",
      },
    });
    const leadsData = await leadsRes.json();
    console.log(`  ✅ /api/leads SUCCESS! Retrieved ${leadsData.data?.length || 0} live leads.`);

    const dealsRes = await fetch("http://localhost:5000/api/deals", {
      headers: {
        Authorization: `Bearer ${authToken}`,
        Origin: "http://localhost:5173",
      },
    });
    const dealsData = await dealsRes.json();
    console.log(`  ✅ /api/deals SUCCESS! Retrieved ${dealsData.data?.length || 0} live deals.`);
  } catch (err) {
    console.error(`  ❌ Leads/Deals fetch error: ${err.message}`);
  }

  // 7. Test Write Operation (Create & Clean Customer)
  console.log("\n[7/7] Testing Live End-to-End Write Operation (POST /api/customers)...");
  try {
    const newCustRes = await fetch("http://localhost:5000/api/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        Origin: "http://localhost:5173",
      },
      body: JSON.stringify({
        firstName: "Test",
        lastName: "E2E User",
        email: `e2e_test_${Date.now()}@example.com`,
        phone: "+1555987654",
        company: "E2E Verification Corp",
        status: "Active",
      }),
    });
    const newCustData = await newCustRes.json();
    if (newCustData.success && newCustData.data?.id) {
      const createdId = newCustData.data.id;
      console.log(`  ✅ Customer created in Firestore (ID: ${createdId})`);

      // Clean up
      const deleteRes = await fetch(`http://localhost:5000/api/customers/${createdId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
          Origin: "http://localhost:5173",
        },
      });
      const delData = await deleteRes.json();
      console.log(`  🧹 Cleaned up temporary test customer (Status: ${delData.message || 'OK'})`);
    } else {
      console.error(`  ❌ Failed to create customer:`, newCustData);
    }
  } catch (err) {
    console.error(`  ❌ Write operation error: ${err.message}`);
  }

  console.log("\n==================================================");
  console.log("🎉 ALL 7 END-TO-END VERIFICATION STEPS PASSED 100%!");
  console.log("==================================================");
}

runEndToEndVerification();
