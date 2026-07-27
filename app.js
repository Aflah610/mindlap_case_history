// Mindlap Case History Management System - Application Controller

// State Store Initialization
let state = {
  currentUser: null,
  psychologists: [],
  ccdStaff: [],
  clients: [],
  caseHistories: {},
  appointments: [],
  documents: [],
  auditLogs: [],
  currentView: 'dashboard',
  currentWizardStep: 1,
  wizardFormData: {},
  activeFilter: 'all',
  searchQuery: ''
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  setupRoleSwitcher();
  setupNavigation();
  setupGlobalSearch();
  renderApp();
  
  // Refresh Lucide icons if loaded
  if (window.lucide) {
    lucide.createIcons();
  }
});

// Load State from LocalStorage or Initial Mock Data
function loadState() {
  const saved = localStorage.getItem('mindlap_state');
  if (saved) {
    try {
      state = JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse saved state, resetting to default", e);
      state = JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));
      saveState();
    }
  } else {
    state = JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));
    state.currentView = 'dashboard';
    state.currentWizardStep = 1;
    state.wizardFormData = {};
    saveState();
  }
}

function saveState() {
  localStorage.setItem('mindlap_state', JSON.stringify(state));
}

// Role Switcher Controller
function setupRoleSwitcher() {
  const roleSelect = document.getElementById('role-select');
  if (!roleSelect) return;

  roleSelect.value = state.currentUser ? state.currentUser.role : 'psychologist';
  
  roleSelect.addEventListener('change', (e) => {
    const role = e.target.value;
    if (role === 'admin') {
      state.currentUser = {
        id: "ADMIN-001",
        name: "Administrator (Director)",
        role: "admin",
        email: "admin@mindlap.com",
        avatar: "AD",
        specialization: "Clinical Director"
      };
    } else if (role === 'ccd') {
      state.currentUser = {
        id: "CCD-001",
        name: "Marcus Vance",
        role: "ccd",
        email: "marcus.vance@mindlap.com",
        avatar: "MV",
        specialization: "CCD Coordinator"
      };
    } else if (role === 'psychologist') {
      state.currentUser = {
        id: "PSY-001",
        name: "Dr. Sarah Jenkins",
        role: "psychologist",
        email: "sarah.jenkins@mindlap.com",
        avatar: "SJ",
        specialization: "Senior Clinical Psychologist"
      };
    }
    
    saveState();
    addAuditLog('ROLE_SWITCH', `Switched active session role to ${role.toUpperCase()}`);
    showToast(`Switched active view role to: ${role.toUpperCase()}`, 'info');
    renderApp();
  });
}

// Global Audit Logger
function addAuditLog(action, details) {
  const logEntry = {
    id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    user: state.currentUser.name,
    role: state.currentUser.role.toUpperCase(),
    action: action,
    details: details,
    ipAddress: '192.168.1.' + Math.floor(Math.random() * 50 + 2)
  };
  state.auditLogs.unshift(logEntry);
  saveState();
}

// Navigation Controller
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const targetView = item.getAttribute('data-view');
      if (targetView) {
        switchView(targetView);
      }
    });
  });
}

function switchView(viewName) {
  state.currentView = viewName;
  saveState();
  renderApp();
}

// Global Search Bar Handler
function setupGlobalSearch() {
  const searchInput = document.getElementById('global-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      renderApp();
    });
  }
}

// Render Master Application
function renderApp() {
  // Update Topbar User Metadata
  const userAvatarEl = document.getElementById('current-user-avatar');
  const userNameEl = document.getElementById('current-user-name');
  const userRoleEl = document.getElementById('current-user-role');
  
  if (state.currentUser) {
    if (userAvatarEl) userAvatarEl.textContent = state.currentUser.avatar;
    if (userNameEl) userNameEl.textContent = state.currentUser.name;
    if (userRoleEl) userRoleEl.textContent = state.currentUser.role.toUpperCase();
  }

  // Update Nav Active States & Visibility based on Role
  document.querySelectorAll('.nav-item').forEach(item => {
    const view = item.getAttribute('data-view');
    item.classList.toggle('active', view === state.currentView);
    
    // Role-based navigation visibility
    if (view === 'staff' && state.currentUser.role !== 'admin') {
      item.style.display = 'none';
    } else if (view === 'audit-log' && state.currentUser.role === 'psychologist') {
      item.style.display = 'none';
    } else {
      item.style.display = 'flex';
    }
  });

  // Render Target View Component
  const contentArea = document.getElementById('main-content');
  if (!contentArea) return;

  switch (state.currentView) {
    case 'dashboard':
      contentArea.innerHTML = renderDashboardView();
      initDashboardCharts();
      break;
    case 'clients':
      contentArea.innerHTML = renderClientsView();
      break;
    case 'case-histories':
      contentArea.innerHTML = renderCaseHistoriesView();
      break;
    case 'case-history-wizard':
      contentArea.innerHTML = renderCaseHistoryWizardView();
      break;
    case 'appointments':
      contentArea.innerHTML = renderAppointmentsView();
      break;
    case 'documents':
      contentArea.innerHTML = renderDocumentsView();
      break;
    case 'staff':
      contentArea.innerHTML = renderStaffView();
      break;
    case 'audit-log':
      contentArea.innerHTML = renderAuditLogView();
      break;
    default:
      contentArea.innerHTML = renderDashboardView();
      initDashboardCharts();
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

// ----------------------------------------------------
// 1. DASHBOARD VIEW
// ----------------------------------------------------
function renderDashboardView() {
  // Compute analytics
  const totalClients = state.clients.length;
  const activeClients = state.clients.filter(c => c.status === 'Active').length;
  const todaySessions = state.appointments.filter(a => a.date === '2026-07-28' || a.date === new Date().toISOString().split('T')[0]).length;
  const pendingCases = state.clients.filter(c => c.caseHistoryStatus === 'Pending' || c.caseHistoryStatus === 'In Progress').length;
  const upcomingFollowups = state.clients.filter(c => c.nextFollowUpDate && new Date(c.nextFollowUpDate) >= new Date('2026-07-24')).length;

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Clinical Dashboard</h1>
        <p class="page-subtitle">Welcome back, ${state.currentUser.name} (${state.currentUser.role.toUpperCase()})</p>
      </div>
      <div class="header-actions">
        ${state.currentUser.role !== 'psychologist' ? `
          <button class="btn btn-primary" onclick="openRegisterClientModal()">
            <i data-lucide="user-plus"></i> Register Client
          </button>
        ` : ''}
        ${state.currentUser.role !== 'ccd' ? `
          <button class="btn btn-secondary" onclick="openNewCaseHistoryWizard()">
            <i data-lucide="file-plus"></i> New Case History
          </button>
        ` : ''}
      </div>
    </div>

    <!-- Analytics Metrics Grid -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-info">
          <p>Total Clients</p>
          <h3>${totalClients}</h3>
        </div>
        <div class="metric-icon-box blue">
          <i data-lucide="users"></i>
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-info">
          <p>Active Clients</p>
          <h3>${activeClients}</h3>
        </div>
        <div class="metric-icon-box green">
          <i data-lucide="user-check"></i>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-info">
          <p>Today's Sessions</p>
          <h3>${todaySessions}</h3>
        </div>
        <div class="metric-icon-box teal">
          <i data-lucide="calendar"></i>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-info">
          <p>Pending Case Histories</p>
          <h3>${pendingCases}</h3>
        </div>
        <div class="metric-icon-box amber">
          <i data-lucide="clock"></i>
        </div>
      </div>
    </div>

    <!-- Analytics Charts Grid -->
    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-card-header">
          <h3 class="chart-card-title">Client Growth & Intake Trend (2026)</h3>
        </div>
        <div class="chart-container">
          <canvas id="clientGrowthChart"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-card-header">
          <h3 class="chart-card-title">Case History Status</h3>
        </div>
        <div class="chart-container">
          <canvas id="caseStatusChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Today's Appointments & Recent Clients Table -->
    <div class="table-card">
      <div class="table-toolbar">
        <h3 style="font-size: 16px; font-weight: 700;">Upcoming & Today's Appointments</h3>
        <button class="btn btn-outline btn-sm" onclick="switchView('appointments')">View All Appointments</button>
      </div>
      <table class="custom-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Client Name</th>
            <th>Client ID</th>
            <th>Psychologist</th>
            <th>Type</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${state.appointments.slice(0, 5).map(apt => `
            <tr>
              <td><strong>${apt.date} ${apt.time}</strong></td>
              <td>${apt.clientName}</td>
              <td><code>${apt.clientId}</code></td>
              <td>${apt.psychologistName}</td>
              <td>${apt.type}</td>
              <td><span class="badge badge-${apt.status.toLowerCase()}">${apt.status}</span></td>
              <td>
                <button class="btn btn-outline btn-sm" onclick="openClientDetailModal('${apt.clientId}')">
                  View Client
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Chart.js Visualizations
function initDashboardCharts() {
  // Client Growth Chart
  const growthCtx = document.getElementById('clientGrowthChart');
  if (growthCtx) {
    new Chart(growthCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [{
          label: 'New Intake Registrations',
          data: [12, 19, 15, 22, 28, 35, 42],
          borderColor: '#0284c7',
          backgroundColor: 'rgba(2, 132, 199, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // Case Status Donut Chart
  const statusCtx = document.getElementById('caseStatusChart');
  if (statusCtx) {
    const completed = state.clients.filter(c => c.caseHistoryStatus === 'Completed').length;
    const inProgress = state.clients.filter(c => c.caseHistoryStatus === 'In Progress').length;
    const pending = state.clients.filter(c => c.caseHistoryStatus === 'Pending').length;

    new Chart(statusCtx, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'In Progress', 'Pending'],
        datasets: [{
          data: [completed, inProgress, pending],
          backgroundColor: ['#0d9488', '#0284c7', '#f59e0b'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }
}

// ----------------------------------------------------
// 2. CLIENTS MANAGEMENT VIEW
// ----------------------------------------------------
function renderClientsView() {
  let filteredClients = state.clients;

  // Role filtering: Psychologists view assigned clients only
  if (state.currentUser.role === 'psychologist') {
    filteredClients = filteredClients.filter(c => c.assignedPsychologistId === state.currentUser.id || c.assignedPsychologistName === state.currentUser.name);
  }

  // Global search filtering
  if (state.searchQuery) {
    const q = state.searchQuery;
    filteredClients = filteredClients.filter(c => 
      c.fullName.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.assignedPsychologistName.toLowerCase().includes(q)
    );
  }

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Client Directory</h1>
        <p class="page-subtitle">Manage client demographics, appointments, and therapy case assignments</p>
      </div>
      <div class="header-actions">
        ${state.currentUser.role !== 'psychologist' ? `
          <button class="btn btn-primary" onclick="openRegisterClientModal()">
            <i data-lucide="user-plus"></i> Register New Client
          </button>
        ` : ''}
      </div>
    </div>

    <div class="table-card">
      <div class="table-toolbar">
        <div class="toolbar-filters">
          <input type="text" class="filter-input" placeholder="Search by Name, ID or Phone..." value="${state.searchQuery}" oninput="updateSearch(this.value)">
          <select class="filter-select" onchange="filterClientsByStatus(this.value)">
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending Intake">Pending Intake</option>
          </select>
        </div>
        <div>
          <span style="font-size: 13px; color: var(--text-muted); font-weight: 600;">
            Showing ${filteredClients.length} of ${state.clients.length} Clients
          </span>
        </div>
      </div>

      <table class="custom-table">
        <thead>
          <tr>
            <th>Client ID</th>
            <th>Full Name</th>
            <th>Age / Gender</th>
            <th>Phone & Email</th>
            <th>Assigned Psychologist</th>
            <th>Case Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filteredClients.length > 0 ? filteredClients.map(client => `
            <tr>
              <td><code>${client.id}</code></td>
              <td><strong>${client.fullName}</strong></td>
              <td>${client.age} yrs (${client.gender})</td>
              <td>
                <div style="font-size: 13px;">${client.phone}</div>
                <div style="font-size: 11px; color: var(--text-muted);">${client.email}</div>
              </td>
              <td>${client.assignedPsychologistName || '<em style="color:var(--text-muted);">Unassigned</em>'}</td>
              <td>
                <span class="badge badge-${client.caseHistoryStatus === 'Completed' ? 'active' : 'pending'}">
                  ${client.caseHistoryStatus}
                </span>
              </td>
              <td>
                <div style="display: flex; gap: 6px;">
                  <button class="btn btn-outline btn-sm" onclick="openClientDetailModal('${client.id}')">
                    <i data-lucide="eye"></i> Details
                  </button>
                  ${state.currentUser.role !== 'psychologist' ? `
                    <button class="btn btn-outline btn-sm" onclick="openAssignPsychologistModal('${client.id}')">
                      <i data-lucide="user-check"></i> Assign
                    </button>
                  ` : ''}
                  ${state.currentUser.role !== 'ccd' ? `
                    <button class="btn btn-secondary btn-sm" onclick="openCaseHistoryWizardForClient('${client.id}')">
                      <i data-lucide="edit-3"></i> Case History
                    </button>
                  ` : ''}
                </div>
              </td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted);">
                No clients found matching criteria.
              </td>
            </tr>
          `}
        </tbody>
      </table>
    </div>
  `;
}

function updateSearch(val) {
  state.searchQuery = val.toLowerCase().trim();
  renderApp();
}

function filterClientsByStatus(status) {
  if (status === 'all') {
    state.searchQuery = '';
  } else {
    state.searchQuery = status.toLowerCase();
  }
  renderApp();
}

// ----------------------------------------------------
// 3. CASE HISTORIES VIEW & WIZARD
// ----------------------------------------------------
function renderCaseHistoriesView() {
  let clientsList = state.clients;
  if (state.currentUser.role === 'psychologist') {
    clientsList = clientsList.filter(c => c.assignedPsychologistId === state.currentUser.id || c.assignedPsychologistName === state.currentUser.name);
  }

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Case Histories</h1>
        <p class="page-subtitle">Clinical assessments, MSE evaluations, diagnoses, and treatment plans</p>
      </div>
      <div class="header-actions">
        ${state.currentUser.role !== 'ccd' ? `
          <button class="btn btn-primary" onclick="openNewCaseHistoryWizard()">
            <i data-lucide="plus-circle"></i> Create New Assessment
          </button>
        ` : ''}
      </div>
    </div>

    ${state.currentUser.role === 'ccd' ? `
      <div class="redacted-box">
        <i data-lucide="shield-alert"></i>
        <h3>CCD Confidentiality Restriction</h3>
        <p>Client Care Department (CCD) staff can view basic client registration data and scheduling. Detailed psychological case notes, MSE reports, risk assessments, and diagnosis details are strictly confidential to clinical staff.</p>
      </div>
    ` : ''}

    <div class="table-card">
      <div class="table-toolbar">
        <h3 style="font-size: 16px; font-weight: 700;">Case History Repository</h3>
      </div>
      <table class="custom-table">
        <thead>
          <tr>
            <th>Client ID & Name</th>
            <th>Primary Diagnosis</th>
            <th>Risk Level</th>
            <th>Last Updated</th>
            <th>Therapist</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${clientsList.map(client => {
            const ch = state.caseHistories[client.id];
            const riskLevel = ch?.riskAssessment?.suicideRisk || 'N/A';
            return `
              <tr>
                <td>
                  <strong>${client.fullName}</strong>
                  <div style="font-size: 12px; color: var(--text-muted);"><code>${client.id}</code></div>
                </td>
                <td>${ch?.diagnosis?.primaryDiagnosis || '<em style="color:var(--text-muted);">Pending Assessment</em>'}</td>
                <td>
                  <span class="badge badge-risk-${riskLevel.toLowerCase() === 'high' ? 'high' : riskLevel.toLowerCase() === 'moderate' ? 'mod' : 'low'}">
                    Risk: ${riskLevel}
                  </span>
                </td>
                <td>${ch?.lastUpdated || 'Not Started'}</td>
                <td>${client.assignedPsychologistName}</td>
                <td><span class="badge badge-${client.caseHistoryStatus === 'Completed' ? 'active' : 'pending'}">${client.caseHistoryStatus}</span></td>
                <td>
                  <div style="display: flex; gap: 6px;">
                    <button class="btn btn-outline btn-sm" onclick="viewCaseHistoryDetails('${client.id}')">
                      <i data-lucide="file-text"></i> View Report
                    </button>
                    ${state.currentUser.role !== 'ccd' ? `
                      <button class="btn btn-secondary btn-sm" onclick="openCaseHistoryWizardForClient('${client.id}')">
                        <i data-lucide="edit"></i> Edit Form
                      </button>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ----------------------------------------------------
// MULTI-STEP CASE HISTORY FORM WIZARD
// ----------------------------------------------------
function openNewCaseHistoryWizard() {
  state.currentWizardStep = 1;
  state.wizardFormData = {
    clientId: state.clients[0] ? state.clients[0].id : '',
    presentingProblems: '',
    durationOfSymptoms: '',
    historyOfPresentIllness: '',
    medicalHistory: '',
    psychiatricHistory: '',
    familyHistory: '',
    personalHistory: '',
    socialHistory: '',
    mse: {
      appearance: 'Well-groomed, dressed appropriately for weather.',
      behavior: 'Cooperative, receptive to interview.',
      speech: 'Normal rate, rhythm, and tone.',
      moodAndAffect: 'Mood calm, affect congruent.',
      thoughtProcess: 'Goal-directed and logical.',
      thoughtContent: 'No delusional or intrusive themes.',
      perception: 'No hallucinations reported.',
      cognition: 'Alert and oriented x4.',
      insightAndJudgment: 'Good insight and judgment.'
    },
    riskAssessment: {
      suicideRisk: 'Low',
      homicideRisk: 'Low',
      selfHarmRisk: 'Low',
      riskNotes: 'No active or passive suicidal/homicidal ideation expressed.'
    },
    diagnosis: {
      primaryDiagnosis: 'F41.1 - Generalized Anxiety Disorder',
      secondaryDiagnosis: 'N/A',
      specifiers: ''
    },
    treatmentPlan: {
      shortTermGoals: '',
      longTermGoals: '',
      modality: 'Cognitive Behavioral Therapy (CBT)'
    },
    homework: '',
    followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };
  switchView('case-history-wizard');
}

function openCaseHistoryWizardForClient(clientId) {
  state.currentWizardStep = 1;
  const existing = state.caseHistories[clientId];
  if (existing) {
    state.wizardFormData = JSON.parse(JSON.stringify(existing));
  } else {
    state.wizardFormData = {
      clientId: clientId,
      presentingProblems: '',
      durationOfSymptoms: '',
      historyOfPresentIllness: '',
      medicalHistory: '',
      psychiatricHistory: '',
      familyHistory: '',
      personalHistory: '',
      socialHistory: '',
      mse: {
        appearance: 'Well-groomed',
        behavior: 'Cooperative',
        speech: 'Normal rate & rhythm',
        moodAndAffect: 'Calm, congruent',
        thoughtProcess: 'Logical',
        thoughtContent: 'No delusions',
        perception: 'Intact',
        cognition: 'Alert x4',
        insightAndJudgment: 'Good'
      },
      riskAssessment: { suicideRisk: 'Low', homicideRisk: 'Low', selfHarmRisk: 'Low', riskNotes: 'Denies ideation' },
      diagnosis: { primaryDiagnosis: 'F41.1 - Generalized Anxiety Disorder', secondaryDiagnosis: '', specifiers: '' },
      treatmentPlan: { shortTermGoals: '', longTermGoals: '', modality: 'CBT' },
      homework: '',
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  }
  switchView('case-history-wizard');
}

function renderCaseHistoryWizardView() {
  const currentStep = state.currentWizardStep;

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Comprehensive Case History Evaluation</h1>
        <p class="page-subtitle">Multi-step clinical assessment wizard for Mindlap psychologists</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-outline" onclick="saveCaseHistoryDraft()">
          <i data-lucide="save"></i> Save Draft
        </button>
        <button class="btn btn-outline" onclick="switchView('case-histories')">Cancel</button>
      </div>
    </div>

    <!-- Step Progress Bar -->
    <div class="wizard-progress">
      <div class="wizard-progress-bar" style="width: ${((currentStep - 1) / 5) * 100}%;"></div>
      
      <div class="wizard-step-node ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}" onclick="goToWizardStep(1)">
        <div class="step-circle">1</div>
        <span class="step-title">Presenting Problem</span>
      </div>

      <div class="wizard-step-node ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}" onclick="goToWizardStep(2)">
        <div class="step-circle">2</div>
        <span class="step-title">HPI & Medical</span>
      </div>

      <div class="wizard-step-node ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}" onclick="goToWizardStep(3)">
        <div class="step-circle">3</div>
        <span class="step-title">Social History</span>
      </div>

      <div class="wizard-step-node ${currentStep === 4 ? 'active' : currentStep > 4 ? 'completed' : ''}" onclick="goToWizardStep(4)">
        <div class="step-circle">4</div>
        <span class="step-title">MSE Exam</span>
      </div>

      <div class="wizard-step-node ${currentStep === 5 ? 'active' : currentStep > 5 ? 'completed' : ''}" onclick="goToWizardStep(5)">
        <div class="step-circle">5</div>
        <span class="step-title">Risk & Diagnosis</span>
      </div>

      <div class="wizard-step-node ${currentStep === 6 ? 'active' : ''}" onclick="goToWizardStep(6)">
        <div class="step-circle">6</div>
        <span class="step-title">Treatment Plan</span>
      </div>
    </div>

    <!-- Wizard Form Step Content Card -->
    <div class="table-card" style="padding: 28px;">
      <form id="wizard-step-form" onsubmit="event.preventDefault();">
        ${renderWizardStepContent(currentStep)}

        <div style="display: flex; justify-content: space-between; margin-top: 32px; pt-3; border-top: 1px solid var(--border-color);">
          <button class="btn btn-outline" ${currentStep === 1 ? 'disabled' : ''} onclick="prevWizardStep()">
            <i data-lucide="arrow-left"></i> Previous Step
          </button>

          ${currentStep < 6 ? `
            <button class="btn btn-primary" onclick="nextWizardStep()">
              Next Step <i data-lucide="arrow-right"></i>
            </button>
          ` : `
            <button class="btn btn-secondary" onclick="submitCompleteCaseHistory()">
              <i data-lucide="check-circle"></i> Finalize Case History
            </button>
          `}
        </div>
      </form>
    </div>
  `;
}

function renderWizardStepContent(step) {
  const data = state.wizardFormData;

  switch (step) {
    case 1:
      return `
        <h3 style="margin-bottom: 20px;">Step 1: Client Selection & Presenting Problems</h3>
        <div class="form-grid">
          <div class="form-group full-width">
            <label class="form-label">Select Client</label>
            <select class="form-select" onchange="state.wizardFormData.clientId = this.value">
              ${state.clients.map(c => `
                <option value="${c.id}" ${data.clientId === c.id ? 'selected' : ''}>
                  ${c.fullName} (${c.id}) - ${c.age}y ${c.gender}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="form-group full-width">
            <label class="form-label">Presenting Problems & Primary Complaints</label>
            <textarea class="form-textarea" oninput="state.wizardFormData.presentingProblems = this.value">${data.presentingProblems || ''}</textarea>
          </div>

          <div class="form-group full-width">
            <label class="form-label">Duration of Symptoms</label>
            <input type="text" class="form-input" placeholder="e.g. 6 months, acute onset past 3 weeks" value="${data.durationOfSymptoms || ''}" oninput="state.wizardFormData.durationOfSymptoms = this.value">
          </div>
        </div>
      `;

    case 2:
      return `
        <h3 style="margin-bottom: 20px;">Step 2: HPI, Medical & Psychiatric History</h3>
        <div class="form-grid">
          <div class="form-group full-width">
            <label class="form-label">History of Present Illness (HPI)</label>
            <textarea class="form-textarea" placeholder="Detailed chronological breakdown of symptom progression..." oninput="state.wizardFormData.historyOfPresentIllness = this.value">${data.historyOfPresentIllness || ''}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Medical History & Physical Illnesses</label>
            <textarea class="form-textarea" oninput="state.wizardFormData.medicalHistory = this.value">${data.medicalHistory || ''}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Past Psychiatric History</label>
            <textarea class="form-textarea" oninput="state.wizardFormData.psychiatricHistory = this.value">${data.psychiatricHistory || ''}</textarea>
          </div>
        </div>
      `;

    case 3:
      return `
        <h3 style="margin-bottom: 20px;">Step 3: Family, Personal & Social History</h3>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Family History (Psychiatric & Substance Use)</label>
            <textarea class="form-textarea" oninput="state.wizardFormData.familyHistory = this.value">${data.familyHistory || ''}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Personal History & Milestones</label>
            <textarea class="form-textarea" oninput="state.wizardFormData.personalHistory = this.value">${data.personalHistory || ''}</textarea>
          </div>

          <div class="form-group full-width">
            <label class="form-label">Social History (Living arrangement, alcohol/substance, relationships)</label>
            <textarea class="form-textarea" oninput="state.wizardFormData.socialHistory = this.value">${data.socialHistory || ''}</textarea>
          </div>
        </div>
      `;

    case 4:
      return `
        <h3 style="margin-bottom: 20px;">Step 4: Mental Status Examination (MSE)</h3>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Appearance & Grooming</label>
            <input type="text" class="form-input" value="${data.mse?.appearance || ''}" oninput="state.wizardFormData.mse.appearance = this.value">
          </div>

          <div class="form-group">
            <label class="form-label">Behavior & Psychomotor</label>
            <input type="text" class="form-input" value="${data.mse?.behavior || ''}" oninput="state.wizardFormData.mse.behavior = this.value">
          </div>

          <div class="form-group">
            <label class="form-label">Speech Pattern</label>
            <input type="text" class="form-input" value="${data.mse?.speech || ''}" oninput="state.wizardFormData.mse.speech = this.value">
          </div>

          <div class="form-group">
            <label class="form-label">Mood & Affect</label>
            <input type="text" class="form-input" value="${data.mse?.moodAndAffect || ''}" oninput="state.wizardFormData.mse.moodAndAffect = this.value">
          </div>

          <div class="form-group">
            <label class="form-label">Thought Process</label>
            <input type="text" class="form-input" value="${data.mse?.thoughtProcess || ''}" oninput="state.wizardFormData.mse.thoughtProcess = this.value">
          </div>

          <div class="form-group">
            <label class="form-label">Thought Content</label>
            <input type="text" class="form-input" value="${data.mse?.thoughtContent || ''}" oninput="state.wizardFormData.mse.thoughtContent = this.value">
          </div>

          <div class="form-group">
            <label class="form-label">Perception</label>
            <input type="text" class="form-input" value="${data.mse?.perception || ''}" oninput="state.wizardFormData.mse.perception = this.value">
          </div>

          <div class="form-group">
            <label class="form-label">Insight & Judgment</label>
            <input type="text" class="form-input" value="${data.mse?.insightAndJudgment || ''}" oninput="state.wizardFormData.mse.insightAndJudgment = this.value">
          </div>
        </div>
      `;

    case 5:
      return `
        <h3 style="margin-bottom: 20px;">Step 5: Clinical Risk Assessment & Diagnosis</h3>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Suicide Risk Level</label>
            <select class="form-select" onchange="state.wizardFormData.riskAssessment.suicideRisk = this.value">
              <option value="Low" ${data.riskAssessment?.suicideRisk === 'Low' ? 'selected' : ''}>Low Risk</option>
              <option value="Moderate" ${data.riskAssessment?.suicideRisk === 'Moderate' ? 'selected' : ''}>Moderate Risk</option>
              <option value="High" ${data.riskAssessment?.suicideRisk === 'High' ? 'selected' : ''}>High Risk (Immediate Intervention Required)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Homicide / Harm to Others</label>
            <select class="form-select" onchange="state.wizardFormData.riskAssessment.homicideRisk = this.value">
              <option value="Low">Low Risk</option>
              <option value="Moderate">Moderate Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>

          <div class="form-group full-width">
            <label class="form-label">Risk Notes & Safety Plan Rationales</label>
            <textarea class="form-textarea" oninput="state.wizardFormData.riskAssessment.riskNotes = this.value">${data.riskAssessment?.riskNotes || ''}</textarea>
          </div>

          <div class="form-group full-width">
            <label class="form-label">Primary DSM-5 / ICD-10 Diagnosis</label>
            <input type="text" class="form-input" placeholder="e.g. F41.1 - Generalized Anxiety Disorder" value="${data.diagnosis?.primaryDiagnosis || ''}" oninput="state.wizardFormData.diagnosis.primaryDiagnosis = this.value">
          </div>
        </div>
      `;

    case 6:
      return `
        <h3 style="margin-bottom: 20px;">Step 6: Treatment Plan, Homework & Follow-up</h3>
        <div class="form-grid">
          <div class="form-group full-width">
            <label class="form-label">Short-term Treatment Goals</label>
            <textarea class="form-textarea" oninput="state.wizardFormData.treatmentPlan.shortTermGoals = this.value">${data.treatmentPlan?.shortTermGoals || ''}</textarea>
          </div>

          <div class="form-group full-width">
            <label class="form-label">Long-term Goals & Therapeutic Modality</label>
            <textarea class="form-textarea" oninput="state.wizardFormData.treatmentPlan.longTermGoals = this.value">${data.treatmentPlan?.longTermGoals || ''}</textarea>
          </div>

          <div class="form-group full-width">
            <label class="form-label">Homework Assignments / Client Recommendations</label>
            <textarea class="form-textarea" oninput="state.wizardFormData.homework = this.value">${data.homework || ''}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Next Follow-up Date</label>
            <input type="date" class="form-input" value="${data.followUpDate || ''}" onchange="state.wizardFormData.followUpDate = this.value">
          </div>
        </div>
      `;
  }
}

function nextWizardStep() {
  if (state.currentWizardStep < 6) {
    state.currentWizardStep++;
    renderApp();
  }
}

function prevWizardStep() {
  if (state.currentWizardStep > 1) {
    state.currentWizardStep--;
    renderApp();
  }
}

function goToWizardStep(step) {
  state.currentWizardStep = step;
  renderApp();
}

function saveCaseHistoryDraft() {
  const clientId = state.wizardFormData.clientId;
  if (!clientId) return showToast('Please select a client first.', 'error');

  state.caseHistories[clientId] = {
    ...state.wizardFormData,
    lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
    completedBy: state.currentUser.name
  };

  // Update Client Status
  const client = state.clients.find(c => c.id === clientId);
  if (client) client.caseHistoryStatus = 'In Progress';

  saveState();
  addAuditLog('CASE_HISTORY_DRAFT', `Saved draft case history for client ${clientId}`);
  showToast('Case history draft saved to LocalStorage', 'success');
}

function submitCompleteCaseHistory() {
  const clientId = state.wizardFormData.clientId;
  if (!clientId) return showToast('Please select a client', 'error');

  state.caseHistories[clientId] = {
    ...state.wizardFormData,
    lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
    completedBy: state.currentUser.name
  };

  const client = state.clients.find(c => c.id === clientId);
  if (client) client.caseHistoryStatus = 'Completed';

  saveState();
  addAuditLog('CASE_HISTORY_SUBMIT', `Completed full Case History for client ${client ? client.fullName : clientId}`);
  showToast('Case History assessment finalized successfully!', 'success');
  switchView('case-histories');
}

// ----------------------------------------------------
// VIEW CASE HISTORY DETAILS & PDF EXPORT
// ----------------------------------------------------
function viewCaseHistoryDetails(clientId) {
  if (state.currentUser.role === 'ccd') {
    showToast('Access Denied: CCD staff cannot view confidential therapy notes.', 'error');
    return;
  }

  const client = state.clients.find(c => c.id === clientId);
  const ch = state.caseHistories[clientId];

  if (!ch) {
    showToast('No Case History record exists yet for this client.', 'info');
    return;
  }

  const modalHtml = `
    <div class="modal-overlay active" id="case-detail-modal">
      <div class="modal-card" style="max-width: 900px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 18px;">Clinical Case History Report: ${client.fullName}</h3>
            <span style="font-size: 12px; color: var(--text-muted);">Client ID: <code>${client.id}</code> | Evaluated by ${ch.completedBy}</span>
          </div>
          <button class="btn btn-outline btn-sm" onclick="closeModal('case-detail-modal')">X</button>
        </div>
        <div class="modal-body" id="printable-case-report">
          <div style="text-align: center; border-bottom: 2px solid var(--primary); padding-bottom: 16px; margin-bottom: 24px;">
            <h2 style="color: var(--primary); font-size: 22px;">MINDLAP THERAPY CLINIC</h2>
            <p style="font-size: 12px; color: var(--text-muted);">Confidential Psychological Evaluation & Case History</p>
          </div>

          <div class="form-grid" style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <div><strong>Client Name:</strong> ${client.fullName}</div>
            <div><strong>Age / Gender:</strong> ${client.age} yrs (${client.gender})</div>
            <div><strong>DOB:</strong> ${client.dob}</div>
            <div><strong>Primary Diagnosis:</strong> ${ch.diagnosis?.primaryDiagnosis || 'N/A'}</div>
          </div>

          <h4 style="color: var(--primary); border-bottom: 1px solid var(--border-color); padding-bottom: 4px; margin-bottom: 12px;">1. Presenting Problems</h4>
          <p style="margin-bottom: 16px; font-size: 14px;">${ch.presentingProblems || 'N/A'}</p>

          <h4 style="color: var(--primary); border-bottom: 1px solid var(--border-color); padding-bottom: 4px; margin-bottom: 12px;">2. Mental Status Examination (MSE)</h4>
          <div class="form-grid" style="font-size: 13px; margin-bottom: 16px;">
            <div><strong>Appearance:</strong> ${ch.mse?.appearance || 'N/A'}</div>
            <div><strong>Behavior:</strong> ${ch.mse?.behavior || 'N/A'}</div>
            <div><strong>Speech:</strong> ${ch.mse?.speech || 'N/A'}</div>
            <div><strong>Mood/Affect:</strong> ${ch.mse?.moodAndAffect || 'N/A'}</div>
            <div><strong>Thought:</strong> ${ch.mse?.thoughtProcess || 'N/A'}</div>
            <div><strong>Insight:</strong> ${ch.mse?.insightAndJudgment || 'N/A'}</div>
          </div>

          <h4 style="color: var(--primary); border-bottom: 1px solid var(--border-color); padding-bottom: 4px; margin-bottom: 12px;">3. Risk Assessment & Diagnosis</h4>
          <div style="margin-bottom: 16px; font-size: 14px;">
            <p><strong>Suicide Risk:</strong> <span class="badge badge-risk-${ch.riskAssessment?.suicideRisk?.toLowerCase()}">${ch.riskAssessment?.suicideRisk}</span></p>
            <p style="margin-top: 6px;"><strong>Clinical Risk Notes:</strong> ${ch.riskAssessment?.riskNotes || 'None'}</p>
          </div>

          <h4 style="color: var(--primary); border-bottom: 1px solid var(--border-color); padding-bottom: 4px; margin-bottom: 12px;">4. Treatment Plan & Homework</h4>
          <p style="font-size: 14px; margin-bottom: 8px;"><strong>Short-Term Goals:</strong> ${ch.treatmentPlan?.shortTermGoals || 'N/A'}</p>
          <p style="font-size: 14px; margin-bottom: 16px;"><strong>Homework Assignment:</strong> ${ch.homework || 'N/A'}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="exportReportPDF('${client.id}')">
            <i data-lucide="download"></i> Download PDF Report
          </button>
          <button class="btn btn-outline" onclick="closeModal('case-detail-modal')">Close</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  addAuditLog('CASE_HISTORY_VIEW', `Viewed Case History for client ${client.fullName}`);
}

function exportReportPDF(clientId) {
  addAuditLog('PDF_EXPORT', `Exported Case History PDF report for client ${clientId}`);
  window.print();
  showToast('Initiating Clinical PDF Print Dialog', 'success');
}

// ----------------------------------------------------
// 4. APPOINTMENTS VIEW
// ----------------------------------------------------
function renderAppointmentsView() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Appointment Management</h1>
        <p class="page-subtitle">Schedule therapy sessions, set follow-ups, and manage consultations</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" onclick="openScheduleAppointmentModal()">
          <i data-lucide="calendar-plus"></i> Schedule Appointment
        </button>
      </div>
    </div>

    <div class="table-card">
      <div class="table-toolbar">
        <h3 style="font-size: 16px; font-weight: 700;">Scheduled Appointments</h3>
      </div>
      <table class="custom-table">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Client Name</th>
            <th>Psychologist</th>
            <th>Session Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${state.appointments.map(apt => `
            <tr>
              <td><strong>${apt.date}</strong> (${apt.time})</td>
              <td>${apt.clientName} <br><code style="font-size: 11px;">${apt.clientId}</code></td>
              <td>${apt.psychologistName}</td>
              <td>${apt.type}</td>
              <td><span class="badge badge-${apt.status.toLowerCase()}">${apt.status}</span></td>
              <td>
                <div style="display: flex; gap: 6px;">
                  <button class="btn btn-outline btn-sm" onclick="toggleAppointmentStatus('${apt.id}')">
                    Toggle Status
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function toggleAppointmentStatus(aptId) {
  const apt = state.appointments.find(a => a.id === aptId);
  if (apt) {
    apt.status = apt.status === 'Upcoming' ? 'Completed' : 'Upcoming';
    saveState();
    addAuditLog('APPOINTMENT_UPDATE', `Updated status of appointment ${aptId} to ${apt.status}`);
    showToast(`Appointment status changed to: ${apt.status}`, 'success');
    renderApp();
  }
}

// ----------------------------------------------------
// 5. DOCUMENTS VIEW
// ----------------------------------------------------
function renderDocumentsView() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Clinical Documents & Records</h1>
        <p class="page-subtitle">Consent forms, medical reports, prescriptions, and psychological assessments</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" onclick="openUploadDocumentModal()">
          <i data-lucide="upload-cloud"></i> Upload Document
        </button>
      </div>
    </div>

    <div class="table-card">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Document Title</th>
            <th>Client Name</th>
            <th>Category</th>
            <th>Uploaded By</th>
            <th>Date & Size</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${state.documents.map(doc => `
            <tr>
              <td><strong>${doc.title}</strong></td>
              <td>${doc.clientName}</td>
              <td><span class="badge badge-completed">${doc.category}</span></td>
              <td>${doc.uploadedBy}</td>
              <td>${doc.uploadDate} (${doc.fileSize})</td>
              <td>
                <button class="btn btn-outline btn-sm" onclick="showToast('Downloading document ${doc.title}...', 'info')">
                  <i data-lucide="download"></i> Download
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ----------------------------------------------------
// 6. STAFF MANAGEMENT VIEW (ADMIN ONLY)
// ----------------------------------------------------
function renderStaffView() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Staff Management</h1>
        <p class="page-subtitle">Manage Mindlap clinical psychologists and CCD staff members</p>
      </div>
    </div>

    <h3 style="margin-bottom: 16px;">Clinical Psychologists</h3>
    <div class="table-card" style="margin-bottom: 32px;">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Name & Title</th>
            <th>Email & Phone</th>
            <th>Specialties</th>
            <th>Active Clients</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${state.psychologists.map(psy => `
            <tr>
              <td><strong>${psy.name}</strong><br><span style="font-size: 12px; color: var(--text-muted);">${psy.title}</span></td>
              <td>${psy.email}<br>${psy.phone}</td>
              <td>${psy.specialties.join(', ')}</td>
              <td><strong>${psy.activeClientsCount}</strong></td>
              <td><span class="badge badge-active">${psy.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <h3 style="margin-bottom: 16px;">Client Care Department (CCD) Staff</h3>
    <div class="table-card">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role Title</th>
            <th>Email</th>
            <th>Shift</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${state.ccdStaff.map(ccd => `
            <tr>
              <td><strong>${ccd.name}</strong></td>
              <td>${ccd.roleTitle}</td>
              <td>${ccd.email}</td>
              <td>${ccd.shift}</td>
              <td><span class="badge badge-active">${ccd.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ----------------------------------------------------
// 7. AUDIT LOG VIEW
// ----------------------------------------------------
function renderAuditLogView() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">System Audit Logs</h1>
        <p class="page-subtitle">Security trail tracking all data access, assignments, updates, and PDF exports</p>
      </div>
    </div>

    <div class="table-card">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User & Role</th>
            <th>Action</th>
            <th>Details</th>
            <th>IP Address</th>
          </tr>
        </thead>
        <tbody>
          ${state.auditLogs.map(log => `
            <tr>
              <td><code>${log.timestamp}</code></td>
              <td><strong>${log.user}</strong> (${log.role})</td>
              <td><span class="badge badge-completed">${log.action}</span></td>
              <td>${log.details}</td>
              <td><code>${log.ipAddress}</code></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ----------------------------------------------------
// MODAL DIALOG CONTROLLERS
// ----------------------------------------------------

// 1. Client Detail Modal
function openClientDetailModal(clientId) {
  const client = state.clients.find(c => c.id === clientId);
  if (!client) return;

  const isCCD = state.currentUser.role === 'ccd';

  const modalHtml = `
    <div class="modal-overlay active" id="client-detail-modal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Client File: ${client.fullName}</h3>
          <button class="btn btn-outline btn-sm" onclick="closeModal('client-detail-modal')">X</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div><strong>Client ID:</strong> <code>${client.id}</code></div>
            <div><strong>Age / Gender:</strong> ${client.age} (${client.gender})</div>
            <div><strong>DOB:</strong> ${client.dob}</div>
            <div><strong>Phone:</strong> ${client.phone}</div>
            <div><strong>Email:</strong> ${client.email}</div>
            <div><strong>Occupation:</strong> ${client.occupation}</div>
            <div><strong>Marital Status:</strong> ${client.maritalStatus}</div>
            <div><strong>Assigned Psychologist:</strong> ${client.assignedPsychologistName}</div>
            <div class="full-width"><strong>Address:</strong> ${client.address}</div>
            <div class="full-width"><strong>Emergency Contact:</strong> ${client.emergencyContact}</div>
          </div>

          ${isCCD ? `
            <div class="redacted-box">
              <i data-lucide="lock"></i>
              <h3>Therapy Notes Redacted</h3>
              <p>CCD staff privileges restrict access to confidential psychologist therapy notes.</p>
            </div>
          ` : `
            <div style="margin-top: 20px; border-top: 1px solid var(--border-color); pt-3;">
              <button class="btn btn-secondary" onclick="closeModal('client-detail-modal'); viewCaseHistoryDetails('${client.id}')">
                <i data-lucide="file-text"></i> Open Psychological Assessment Report
              </button>
            </div>
          `}
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('client-detail-modal')">Close</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// 2. Register Client Modal
function openRegisterClientModal() {
  const newId = `ML-2026-00${state.clients.length + 1}`;
  const modalHtml = `
    <div class="modal-overlay active" id="register-client-modal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Register New Intake Client</h3>
          <button class="btn btn-outline btn-sm" onclick="closeModal('register-client-modal')">X</button>
        </div>
        <div class="modal-body">
          <form id="reg-form" onsubmit="handleRegisterClientSubmit(event)">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Client ID (Auto Generated)</label>
                <input type="text" class="form-input" id="reg-id" value="${newId}" readonly>
              </div>

              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-input" id="reg-name" required placeholder="e.g. Eleanor Vance">
              </div>

              <div class="form-group">
                <label class="form-label">Age</label>
                <input type="number" class="form-input" id="reg-age" required value="29">
              </div>

              <div class="form-group">
                <label class="form-label">Gender</label>
                <select class="form-select" id="reg-gender">
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-binary">Non-binary</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input type="text" class="form-input" id="reg-phone" required value="+1 (555) 019-2831">
              </div>

              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" class="form-input" id="reg-email" required value="eleanor@example.com">
              </div>

              <div class="form-group full-width">
                <label class="form-label">Assign Initial Psychologist</label>
                <select class="form-select" id="reg-psy">
                  ${state.psychologists.map(p => `<option value="${p.id}">${p.name} (${p.title})</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="modal-footer" style="padding-top: 20px; border-top: 1px solid var(--border-color);">
              <button type="submit" class="btn btn-primary">Register Client</button>
              <button type="button" class="btn btn-outline" onclick="closeModal('register-client-modal')">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function handleRegisterClientSubmit(e) {
  e.preventDefault();
  const newClient = {
    id: document.getElementById('reg-id').value,
    fullName: document.getElementById('reg-name').value,
    age: parseInt(document.getElementById('reg-age').value),
    gender: document.getElementById('reg-gender').value,
    dob: "1997-05-12",
    phone: document.getElementById('reg-phone').value,
    email: document.getElementById('reg-email').value,
    address: "Springfield, OR",
    emergencyContact: "Family Contact - +1 (555) 999-0000",
    occupation: "Client",
    maritalStatus: "Single",
    assignedPsychologistId: document.getElementById('reg-psy').value,
    assignedPsychologistName: state.psychologists.find(p => p.id === document.getElementById('reg-psy').value).name,
    status: "Active",
    registrationDate: new Date().toISOString().split('T')[0],
    caseHistoryStatus: "Pending",
    nextFollowUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };

  state.clients.unshift(newClient);
  saveState();
  addAuditLog('CLIENT_REGISTER', `Registered new client ${newClient.fullName} (${newClient.id})`);
  showToast(`Registered client ${newClient.fullName}`, 'success');
  closeModal('register-client-modal');
  renderApp();
}

// Helper Modal Closer
function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.remove();
}

// Floating Toast Notification System
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-triangle' : 'info'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
