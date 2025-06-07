
// src/lib/db.ts
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import type { JsaInput as JsaInputTypeFromAction } from '@/actions/jsaActions';
import type { IncidentInput as IncidentInputType } from '@/actions/incidentActions';
import bcrypt from 'bcryptjs'; // Importar bcrypt para hashear a senha do superusuário


// Variável global para armazenar a conexão do banco de dados
let db: Database | null = null;

/**
 * Abre e retorna a conexão com o banco de dados SQLite.
 * Cria o banco de dados e as tabelas se não existirem.
 * Popula com dados de exemplo se as tabelas estiverem vazias.
 *
 * !!! IMPORTANTE !!!
 * Se você encontrar erros como "no such column" ou "table ... has no column named ...",
 * pode ser que o schema do banco de dados tenha sido atualizado (neste arquivo)
 * mas o arquivo ehs_database.sqlite no seu disco ainda está com o schema antigo.
 * A maneira mais simples de resolver isso durante o desenvolvimento é:
 * 1. Parar a aplicação.
 * 2. Excluir o arquivo `ehs_database.sqlite` da raiz do seu projeto.
 * 3. Reiniciar a aplicação. Isso forçará a recriação do banco de dados com o schema mais recente.
 * !!! CUIDADO: ISSO APAGARÁ TODOS OS DADOS EXISTENTES NO BANCO DE DADOS LOCAL. !!!
 */
export async function getDbConnection(): Promise<Database> {
  if (db) {
    console.log('[DB:getDbConnection] Usando conexão SQLite existente.');
    return db;
  }

  console.log('[DB:getDbConnection] Tentando abrir NOVA conexão com SQLite (arquivo: ./ehs_database.sqlite)...');
  try {
    db = await open({
      filename: './ehs_database.sqlite', // Este arquivo será criado na raiz do projeto
      driver: sqlite3.Database,
    });
    console.log('[DB:getDbConnection] Conexão com SQLite estabelecida com sucesso.');
  } catch (error) {
    console.error('[DB:getDbConnection] FALHA ao abrir conexão com SQLite:', error);
    throw error; // Re-throw para que a aplicação saiba que falhou
  }

  try {
    await db.run('PRAGMA foreign_keys = ON');
    console.log('[DB:getDbConnection] PRAGMA foreign_keys habilitado.');

    console.log('[DB:getDbConnection] Verificando/Criando tabelas...');
    await db.exec(`
      CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT,
        department TEXT,
        hire_date TEXT, -- YYYY-MM-DD
        birth_date TEXT, -- YYYY-MM-DD
        rg TEXT,
        cpf TEXT UNIQUE,
        phone TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        type TEXT,
        address TEXT,
        contact_person TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS equipment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT,
        location_id INTEGER,
        serial_number TEXT UNIQUE,
        brand TEXT,
        model TEXT,
        acquisition_date TEXT, -- YYYY-MM-DD
        status TEXT DEFAULT 'Operacional',
        maintenance_schedule TEXT,
        last_maintenance_date TEXT, -- YYYY-MM-DD
        next_maintenance_date TEXT, -- YYYY-MM-DD
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS trainings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_name TEXT NOT NULL UNIQUE,
        description TEXT,
        provider TEXT,
        duration_hours INTEGER,
        frequency_months INTEGER,
        target_audience TEXT,
        content_outline TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS training_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        training_id INTEGER NOT NULL,
        completion_date TEXT NOT NULL, -- YYYY-MM-DD
        expiry_date TEXT, -- YYYY-MM-DD
        score REAL,
        status TEXT DEFAULT 'Concluído',
        certificate_path TEXT,
        instructor_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        is_active INTEGER DEFAULT 1,
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS jsa (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task TEXT NOT NULL,
        location_name TEXT, -- Alterado de location_id
        department TEXT,
        responsible_person_name TEXT, -- Alterado de responsible_person_id
        team_members TEXT,
        required_ppe TEXT,
        status TEXT DEFAULT 'Rascunho',
        creation_date TEXT DEFAULT (strftime('%Y-%m-%d', 'now')),
        review_date TEXT, -- YYYY-MM-DD
        approval_date TEXT, -- YYYY-MM-DD
        approver_id INTEGER,
        attachment_path TEXT, -- Coluna para o caminho do anexo
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        file_path TEXT,
        version TEXT,
        upload_date TEXT DEFAULT (strftime('%Y-%m-%d', 'now')),
        review_date TEXT, -- YYYY-MM-DD
        status TEXT DEFAULT 'Ativo',
        jsa_id INTEGER,
        author_id INTEGER,
        owner_department TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (jsa_id) REFERENCES jsa(id) ON DELETE SET NULL,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS kpis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        value REAL NOT NULL,
        category TEXT,
        unit TEXT,
        target REAL,
        period TEXT,
        data_date TEXT, -- YYYY-MM-DD
        source TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS jsa_steps (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          jsa_id INTEGER NOT NULL,
          step_order INTEGER NOT NULL,
          description TEXT NOT NULL,
          hazards TEXT NOT NULL,
          controls TEXT NOT NULL,
          risk_level_before TEXT,
          risk_level_after TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (jsa_id) REFERENCES jsa(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        date TEXT NOT NULL, -- YYYY-MM-DD HH:MM:SS
        type TEXT NOT NULL,
        severity TEXT,
        location_id INTEGER,
        involved_persons_ids TEXT,
        root_cause TEXT,
        corrective_actions TEXT,
        preventive_actions TEXT,
        investigation_responsible_id INTEGER,
        lost_days INTEGER DEFAULT 0,
        cost REAL DEFAULT 0.0,
        reported_by_id INTEGER,
        status TEXT DEFAULT 'Aberto',
        closure_date TEXT, -- YYYY-MM-DD
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
        FOREIGN KEY (reported_by_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (investigation_responsible_id) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS action_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        origin TEXT,
        responsible_id INTEGER,
        due_date TEXT, -- YYYY-MM-DD
        priority TEXT DEFAULT 'Média',
        status TEXT DEFAULT 'Aberta',
        completion_date TEXT, -- YYYY-MM-DD
        effectiveness_check_date TEXT, -- YYYY-MM-DD
        effectiveness_notes TEXT,
        evidence TEXT,
        cost REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (responsible_id) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS audits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        scope TEXT NOT NULL,
        audit_date TEXT NOT NULL, -- YYYY-MM-DD
        auditor TEXT NOT NULL,
        lead_auditor_id INTEGER,
        findings TEXT,
        non_conformities_count INTEGER DEFAULT 0,
        observations_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Planejada',
        report_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_auditor_id) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS audit_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        audit_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        severity TEXT,
        related_requirement TEXT,
        action_plan_id INTEGER,
        status TEXT DEFAULT 'Aberta',
        closure_date TEXT, -- YYYY-MM-DD
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE,
        FOREIGN KEY (action_plan_id) REFERENCES action_plans(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS work_permits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        location_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        requester_id INTEGER NOT NULL,
        approver_id INTEGER,
        executor_team TEXT,
        start_datetime TEXT NOT NULL, -- YYYY-MM-DD HH:MM:SS
        end_datetime TEXT NOT NULL, -- YYYY-MM-DD HH:MM:SS
        precautions TEXT,
        equipment_used TEXT,
        status TEXT DEFAULT 'Solicitada',
        closure_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT,
        FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE RESTRICT,
        FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE RESTRICT
      );

      CREATE TABLE IF NOT EXISTS ppe_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        specification TEXT,
        ca_number_default TEXT,
        lifespan_months INTEGER,
        manufacturer TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ppe_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        ppe_type_id INTEGER NOT NULL,
        delivery_date TEXT NOT NULL, -- YYYY-MM-DD
        quantity INTEGER DEFAULT 1,
        ca_number TEXT,
        receipt_signed INTEGER DEFAULT 0,
        return_date TEXT, -- YYYY-MM-DD
        due_date TEXT, -- YYYY-MM-DD
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (ppe_type_id) REFERENCES ppe_types(id) ON DELETE RESTRICT
      );

      CREATE TABLE IF NOT EXISTS legal_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_number TEXT UNIQUE,
        claimant_name TEXT,
        subject TEXT,
        status TEXT DEFAULT 'Em Andamento',
        filed_date TEXT, -- YYYY-MM-DD
        court TEXT,
        company_lawyer TEXT,
        opposing_lawyer TEXT,
        estimated_cost REAL,
        final_cost REAL,
        provision_value REAL,
        details TEXT,
        last_update_date TEXT, -- YYYY-MM-DD
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS asos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        exam_date TEXT NOT NULL, -- YYYY-MM-DD
        result TEXT NOT NULL,
        restrictions TEXT,
        doctor_name TEXT,
        crm TEXT,
        clinic_name TEXT,
        next_exam_due_date TEXT, -- YYYY-MM-DD
        observations TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS occupational_diseases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        disease_name TEXT NOT NULL,
        cid TEXT,
        diagnosis_date TEXT, -- YYYY-MM-DD
        related_activity TEXT,
        cat_issued INTEGER DEFAULT 0,
        cat_number TEXT,
        status TEXT DEFAULT 'Suspeita',
        details TEXT,
        treatment_info TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS absenteeism_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        start_date TEXT NOT NULL, -- YYYY-MM-DD
        end_date TEXT NOT NULL, -- YYYY-MM-DD
        reason TEXT NOT NULL,
        medical_certificate_code TEXT,
        lost_hours REAL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS agent_monitoring (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location_id INTEGER,
        ghe_id INTEGER,
        agent_type TEXT NOT NULL,
        measurement_date TEXT NOT NULL, -- YYYY-MM-DD
        measurement_value REAL NOT NULL,
        unit TEXT NOT NULL,
        legal_limit REAL,
        action_level REAL,
        instrument TEXT,
        responsible_technician_id INTEGER,
        report_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
        FOREIGN KEY (responsible_technician_id) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS psychosocial_evaluations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        evaluation_date TEXT NOT NULL, -- YYYY-MM-DD
        type TEXT,
        target_group TEXT,
        overall_score REAL,
        key_findings TEXT,
        recommendations TEXT,
        responsible_id INTEGER,
        report_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (responsible_id) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS vaccination_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        vaccine_name TEXT NOT NULL,
        dose TEXT,
        vaccination_date TEXT NOT NULL, -- YYYY-MM-DD
        batch_number TEXT,
        provider TEXT,
        next_due_date TEXT, -- YYYY-MM-DD
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS waste_generation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL, -- YYYY-MM-DD
        location_id INTEGER,
        waste_type TEXT NOT NULL,
        classification TEXT,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        destination TEXT,
        transporter_name TEXT,
        mrf_number TEXT,
        cost REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS water_consumption (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL, -- YYYY-MM-DD
        location_id INTEGER,
        reading REAL NOT NULL,
        unit TEXT DEFAULT 'm³',
        source TEXT DEFAULT 'Rede Pública',
        meter_number TEXT,
        cost REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS energy_consumption (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL, -- YYYY-MM-DD
        location_id INTEGER,
        reading REAL NOT NULL,
        unit TEXT DEFAULT 'kWh',
        source TEXT DEFAULT 'Rede Elétrica',
        meter_number TEXT,
        cost REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS ghg_emissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL, -- YYYY-MM-DD
        location_id INTEGER,
        source_type TEXT NOT NULL,
        emission_factor REAL,
        activity_data REAL NOT NULL,
        activity_unit TEXT NOT NULL,
        co2e_emission REAL NOT NULL,
        unit TEXT DEFAULT 'tCO₂e',
        scope INTEGER,
        calculation_methodology TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS environmental_incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_id INTEGER UNIQUE,
        date DATETIME NOT NULL, -- YYYY-MM-DD HH:MM:SS
        location_id INTEGER,
        type TEXT NOT NULL,
        substance TEXT NOT NULL,
        quantity REAL,
        unit TEXT,
        affected_area TEXT,
        immediate_actions TEXT,
        cleanup_status TEXT DEFAULT 'Em Andamento',
        reporting_status TEXT,
        environmental_impact TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE SET NULL,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS environmental_infractions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        infraction_number TEXT UNIQUE NOT NULL,
        issuing_body TEXT NOT NULL,
        issue_date TEXT NOT NULL, -- YYYY-MM-DD
        description TEXT NOT NULL,
        legal_basis TEXT,
        fine_amount REAL,
        status TEXT DEFAULT 'Em Análise',
        defense_deadline TEXT, -- YYYY-MM-DD
        payment_due_date TEXT, -- YYYY-MM-DD
        resolution TEXT,
        resolution_date TEXT, -- YYYY-MM-DD
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS chemical_inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name TEXT NOT NULL,
        cas_number TEXT,
        location_id INTEGER,
        storage_area TEXT,
        quantity REAL,
        unit TEXT,
        hazard_class TEXT,
        sds_path TEXT,
        supplier_name TEXT,
        acquisition_date TEXT, -- YYYY-MM-DD
        last_updated TEXT DEFAULT (strftime('%Y-%m-%d', 'now')), -- YYYY-MM-DD
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
      );
    `);
    console.log('[DB:getDbConnection] Tabelas SQLite verificadas/criadas com sucesso.');
  } catch (error) {
    console.error('[DB:getDbConnection] FALHA ao executar PRAGMA ou CREATE TABLE:', error);
    // Se falhar aqui, a conexão db pode ou não estar válida.
    // Decidir se quer fechar ou deixar para a próxima tentativa. Por ora, vamos re-throw.
    throw error;
  }

  await populateSampleData(db);
  return db;
}

async function populateSampleData(db: Database) {
  const isUsersEmpty = await db.get('SELECT COUNT(*) as count FROM users');
  if (isUsersEmpty && isUsersEmpty.count === 0) {
    console.log('[DB:populateSampleData] Populando dados de exemplo para Users...');
    // Senhas dummy para usuários de exemplo (exceto o superusuário)
    const dummyHash = await bcrypt.hash('password123', 10); // Hashear uma senha padrão
    const superPasswordHash = await bcrypt.hash('Super', 10); // Hashear a senha do superusuário

    await db.run('INSERT INTO users (id, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)', 1, 'Admin EHS', 'admin@ehscontrol.com', dummyHash, 'admin', 1);
    await db.run('INSERT INTO users (id, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)', 2, 'Gerente Seg', 'gerente.seg@company.com', dummyHash, 'manager', 1);
    await db.run('INSERT INTO users (id, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)', 3, 'Técnico SST', 'tecnico.sst@company.com', dummyHash, 'user', 1);
    
    // Superusuário com e-mail biancofialho@gmail.com e senha "Super"
    await db.run('INSERT INTO users (id, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)', 4, 'Bianco Fialho (Superadmin)', 'biancofialho@gmail.com', superPasswordHash, 'admin', 1);
    
    await db.run('INSERT INTO users (id, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)', 5, 'Usuário Inativo', 'inativo@company.com', dummyHash, 'user', 0);
    await db.run('INSERT INTO users (id, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)', 6, 'Alice Silva (Usuário)', 'alice@company.com', dummyHash, 'user', 1);
    await db.run('INSERT INTO users (id, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)', 7, 'Bruno Costa (Usuário)', 'bruno@company.com', dummyHash, 'user', 1);
    console.log('[DB:populateSampleData] Dados de exemplo para Users populados.');
  }


  const isLocationsEmpty = await db.get('SELECT COUNT(*) as count FROM locations');
  if (isLocationsEmpty && isLocationsEmpty.count === 0) {
    console.log('[DB:populateSampleData] Populando dados de exemplo para Locations...');
    await db.run('INSERT INTO locations (id, name, description, type) VALUES (?, ?, ?, ?)', 1, 'Fábrica - Setor A', 'Área de produção principal', 'Fábrica');
    await db.run('INSERT INTO locations (id, name, description, type) VALUES (?, ?, ?, ?)', 2, 'Almoxarifado Central', 'Armazenamento de materiais', 'Armazém');
    await db.run('INSERT INTO locations (id, name, description, type) VALUES (?, ?, ?, ?)', 3, 'Escritório - RH', 'Recursos Humanos', 'Escritório');
    await db.run('INSERT INTO locations (id, name, description, type) VALUES (?, ?, ?, ?)', 4, 'Laboratório Químico', 'Análises e testes', 'Laboratório');
    await db.run('INSERT INTO locations (id, name, description, type) VALUES (?, ?, ?, ?)', 5, 'Pátio Externo', 'Área de carga e descarga', 'Externo');
    await db.run('INSERT INTO locations (id, name, description, type) VALUES (?, ?, ?, ?)', 6, 'Fábrica - Telhado', 'Telhado do bloco principal', 'Fábrica');
    await db.run('INSERT INTO locations (id, name, description, type) VALUES (?, ?, ?, ?)', 7, 'Oficina Manutenção', 'Manutenção Mecânica/Elétrica', 'Oficina');
    console.log('[DB:populateSampleData] Dados de exemplo para Locations populados.');
  }


  const isEmployeesEmpty = await db.get('SELECT COUNT(*) as count FROM employees');
  if (isEmployeesEmpty && isEmployeesEmpty.count === 0) {
    console.log('[DB:populateSampleData] Populando dados de exemplo para Employees...');
    await db.run('INSERT INTO employees (id, name, role, department, hire_date, birth_date, rg, cpf, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 1, 'Alice Silva', 'Operadora', 'Produção', '2022-03-15', '1990-05-20', '123456789', '111.222.333-44', '(11) 98765-4321', 'Rua das Flores, 123');
    await db.run('INSERT INTO employees (id, name, role, department, hire_date, birth_date, rg, cpf, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 2, 'Bruno Costa', 'Técnico Manutenção', 'Manutenção', '2021-08-01', '1985-11-10', '987654321', '222.333.444-55', '(22) 91234-5678', 'Avenida Principal, 456');
    await db.run('INSERT INTO employees (id, name, role, department, hire_date, birth_date, rg, cpf, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 3, 'Carlos Dias', 'Almoxarife', 'Logística', '2023-01-10', '1995-02-25', '456789123', '333.444.555-66', '(33) 99876-1234', 'Travessa da Paz, 789');
    await db.run('INSERT INTO employees (id, name, role, department, hire_date, birth_date, rg, cpf, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 4, 'Diana Souza', 'Analista RH', 'RH', '2020-11-20', '1992-09-15', '321654987', '444.555.666-77', '(44) 98888-4444', 'Alameda dos Anjos, 101');
    await db.run('INSERT INTO employees (id, name, role, department, hire_date, birth_date, rg, cpf, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 5, 'Eduardo Lima', 'Químico', 'Laboratório', '2022-05-05', '1988-07-30', '789123456', '555.666.777-88', '(55) 97777-5555', 'Praça Central, 202');
    console.log('[DB:populateSampleData] Dados de exemplo para Employees populados.');
  }

  const isIncidentsEmpty = await db.get('SELECT COUNT(*) as count FROM incidents');
  if (isIncidentsEmpty && isIncidentsEmpty.count === 0) {
    console.log('[DB:populateSampleData] Populando dados de exemplo para Incidents...');
    await db.run('INSERT INTO incidents (id, date, type, severity, location_id, status, description, reported_by_id, lost_days, root_cause, corrective_actions, preventive_actions, investigation_responsible_id, cost, closure_date, involved_persons_ids) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      1, '2024-08-17 10:30:00', 'Acidente sem Afastamento', 'Leve', 1, 'Fechado', 'Corte superficial no dedo ao manusear peça.', 3, 0, 'Falta de atenção ao manusear ferramenta cortante.', 'Fornecer luvas de proteção adequadas. Realizar DDS sobre manuseio seguro de ferramentas.', 'Revisar JSA da tarefa para incluir uso obrigatório de luvas.', 3, 50.00, '2024-08-20', '1');
    await db.run('INSERT INTO incidents (id, date, type, severity, location_id, status, description, reported_by_id, lost_days, root_cause, corrective_actions, preventive_actions, investigation_responsible_id, cost, closure_date, involved_persons_ids) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      2, '2024-08-18 14:00:00', 'Acidente com Afastamento', 'Moderado', 1, 'Em Investigação', 'Entorse no tornozelo ao descer escada da máquina.', 3, 5, null, null, null, 2, 350.00, null, '2');
    await db.run('INSERT INTO incidents (id, date, type, severity, location_id, status, description, reported_by_id, lost_days, root_cause, corrective_actions, preventive_actions, investigation_responsible_id, cost, closure_date, involved_persons_ids) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      3, '2024-08-19 09:15:00', 'Quase Acidente', 'N/A', 2, 'Fechado', 'Caixa caiu de prateleira próxima ao funcionário Carlos.', 1, 0, 'Armazenamento inadequado de caixas.', 'Reorganizar prateleiras, instalar anteparos.', 'Treinamento sobre empilhamento seguro.', 2, 0.00, '2024-08-21', '3');
    await db.run('INSERT INTO incidents (id, date, type, severity, location_id, status, description, reported_by_id, lost_days, root_cause, corrective_actions, preventive_actions, investigation_responsible_id, cost, closure_date, involved_persons_ids) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      4, '2024-08-22 11:00:00', 'Incidente Ambiental', 'Insignificante', 5, 'Aberto', 'Pequeno vazamento de óleo contido na área de descarte.', 2, 0, 'Falha na vedação de tambor.', 'Substituir vedação do tambor.', 'Inspeção periódica de tambores.', null, 20.00, null, null);
    await db.run('INSERT INTO incidents (id, date, type, severity, location_id, status, description, reported_by_id, lost_days, root_cause, corrective_actions, preventive_actions, investigation_responsible_id, cost, closure_date, involved_persons_ids) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      5, '2024-08-23 16:45:00', 'Quase Acidente', 'N/A', 1, 'Aguardando Ação', 'Piso escorregadio devido a vazamento de óleo na máquina Y.', 6, 0, 'Vazamento na máquina Y.', 'Limpar área, sinalizar e solicitar reparo da máquina Y.', 'Manutenção preventiva na máquina Y.', null, 0.00, null, null);
    await db.run('INSERT INTO incidents (id, date, type, severity, location_id, status, description, reported_by_id, lost_days, root_cause, corrective_actions, preventive_actions, investigation_responsible_id, cost, closure_date, involved_persons_ids) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      6, '2024-08-24 08:00:00', 'Acidente sem Afastamento', 'Leve', 3, 'Aberto', 'Colisão com mobília, resultando em hematoma.', 4, 0, null, null, null, null, 0.00, null, '4');
    await db.run('INSERT INTO incidents (id, date, type, severity, location_id, status, description, reported_by_id, lost_days, root_cause, corrective_actions, preventive_actions, investigation_responsible_id, cost, closure_date, involved_persons_ids) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      7, '2024-07-10 15:20:00', 'Acidente com Afastamento', 'Grave', 7, 'Fechado', 'Queda de escada durante reparo em altura.', 2, 30, 'Uso de escada inadequada/instável.', 'Fornecer treinamento de trabalho em altura, substituir escada por plataforma elevatória quando possível.', 'Inspeção regular de escadas e equipamentos de acesso.', 2, 2500.00, '2024-08-10', '2,5');
    console.log('[DB:populateSampleData] Dados de exemplo para Incidents populados.');
  }

  const isJsaEmpty = await db.get('SELECT COUNT(*) as count FROM jsa');
  if (isJsaEmpty && isJsaEmpty.count === 0) {
    console.log('[DB:populateSampleData] Populando dados de exemplo para JSA...');
    await db.run('INSERT INTO jsa (id, task, location_name, department, responsible_person_name, team_members, required_ppe, status, review_date, attachment_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      1, 'Manutenção Preventiva Prensa XPTO', 'Fábrica - Setor A', 'Manutenção', 'Técnico SST (Exemplo)', 'João Silva, Maria Oliveira', 'Capacete, Óculos, Luvas, Botas', 'Ativo', '2024-08-01', '/uploads/jsa_prensa_xpto_v1.xlsx');
    await db.run('INSERT INTO jsa (id, task, location_name, department, responsible_person_name, status, review_date, attachment_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      2, 'Limpeza de Tanque Químico T-02', 'Laboratório Químico', 'Produção', 'Gerente Seg (Exemplo)', 'Revisado', '2024-07-15', null);
    await db.run('INSERT INTO jsa (id, task, location_name, department, responsible_person_name, status) VALUES (?, ?, ?, ?, ?, ?)',
      3, 'Trabalho em Altura - Telhado Bloco B', 'Fábrica - Telhado', 'Manutenção', 'Admin EHS (Exemplo)', 'Rascunho');
    console.log('[DB:populateSampleData] Dados de exemplo para JSA populados.');
  }

  const isActionPlansEmpty = await db.get('SELECT COUNT(*) as count FROM action_plans');
  if (isActionPlansEmpty && isActionPlansEmpty.count === 0) {
    console.log('[DB:populateSampleData] Populando dados de exemplo para Action Plans...');
    await db.run('INSERT INTO action_plans (id, description, origin, responsible_id, due_date, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)', 1, 'Instalar guarda-corpo na plataforma P-102', 'Inspeção de Segurança ID 12', 2, '2024-09-15', 'Alta', 'Aberta');
    await db.run('INSERT INTO action_plans (id, description, origin, responsible_id, due_date, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)', 2, 'Revisar procedimento de bloqueio e etiquetagem', 'Auditoria Interna ID 5 (NC-003)', 3, '2024-08-30', 'Alta', 'Em Andamento');
    await db.run('INSERT INTO action_plans (id, description, origin, responsible_id, due_date, priority, status, completion_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 3, 'Sinalizar área de tráfego de empilhadeiras', 'Incidente ID 3 (Quase Acidente)', 1, '2024-07-31', 'Média', 'Concluída', '2024-07-28');
    await db.run('INSERT INTO action_plans (id, description, origin, responsible_id, due_date, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)', 4, 'Adquirir novos protetores auriculares tipo concha', 'Monitoramento de Ruído (Setor A)', 2, '2024-08-20', 'Baixa', 'Atrasada');
    await db.run('INSERT INTO action_plans (id, description, origin, responsible_id, due_date, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)', 5, 'Treinamento sobre uso de extintores para Brigada', 'Plano Anual de Treinamentos', 3, '2024-10-15', 'Média', 'Aberta');
    console.log('[DB:populateSampleData] Dados de exemplo para Action Plans populados.');
  }
  console.log('[DB:populateSampleData] Verificação/População de dados de exemplo concluída.');
}


export async function closeDbConnection(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
    console.log('[DB] Conexão com SQLite fechada.');
  }
}

// --- Incidents ---
export async function insertIncident(incidentData: Omit<IncidentInputType, 'id'>): Promise<number | undefined> {
    const db = await getDbConnection();
    console.log('[DB:insertIncident] Dados recebidos para inserção:', incidentData);
    try {
        const result = await db.run(
            `INSERT INTO incidents (
                description, date, type, severity, location_id, reported_by_id, status,
                root_cause, corrective_actions, preventive_actions, involved_persons_ids,
                investigation_responsible_id, lost_days, cost, closure_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            incidentData.description, incidentData.date, incidentData.type,
            incidentData.severity ?? null, incidentData.locationId ?? null,
            incidentData.reportedById ?? null, incidentData.status ?? 'Aberto',
            incidentData.root_cause ?? null, incidentData.corrective_actions ?? null,
            incidentData.preventive_actions ?? null, incidentData.involved_persons_ids ?? null,
            incidentData.investigation_responsible_id ?? null, incidentData.lost_days ?? null,
            incidentData.cost ?? null, incidentData.closure_date ?? null
        );
        console.log('[DB:insertIncident] Incidente inserido com sucesso. ID:', result.lastID, 'Alterações:', result.changes);
        return result.lastID;
    } catch (error) {
        console.error('[DB:insertIncident] Erro ao inserir incidente:', error);
        throw error;
    }
}

export async function updateIncidentInDb(id: number, incidentData: Omit<IncidentInputType, 'id'>): Promise<boolean> {
    const db = await getDbConnection();
    console.log(`[DB:updateIncidentInDb] Atualizando incidente ID ${id} com dados:`, incidentData);
    try {
        const result = await db.run(
            `UPDATE incidents SET
                description = ?, date = ?, type = ?, severity = ?, location_id = ?,
                reported_by_id = ?, status = ?, root_cause = ?, corrective_actions = ?,
                preventive_actions = ?, involved_persons_ids = ?, investigation_responsible_id = ?,
                lost_days = ?, cost = ?, closure_date = ?
            WHERE id = ?`,
            incidentData.description, incidentData.date, incidentData.type, incidentData.severity ?? null,
            incidentData.locationId ?? null, incidentData.reportedById ?? null, incidentData.status ?? 'Aberto',
            incidentData.root_cause ?? null, incidentData.corrective_actions ?? null,
            incidentData.preventive_actions ?? null, incidentData.involved_persons_ids ?? null,
            incidentData.investigation_responsible_id ?? null, incidentData.lost_days ?? null,
            incidentData.cost ?? null, incidentData.closure_date ?? null,
            id
        );
        console.log('[DB:updateIncidentInDb] Incidente atualizado com sucesso. Alterações:', result.changes);
        return (result.changes ?? 0) > 0;
    } catch (error) {
        console.error(`[DB:updateIncidentInDb] Erro ao atualizar incidente ID ${id}:`, error);
        throw error;
    }
}

export async function getIncidentById(id: number) {
    const db = await getDbConnection();
    console.log(`[DB:getIncidentById] Buscando incidente com ID: ${id}`);
    const incident = await db.get(`
        SELECT i.*, l.name as location_name, u_rep.name as reporter_name, u_inv.name as investigation_responsible_name
        FROM incidents i
        LEFT JOIN locations l ON i.location_id = l.id
        LEFT JOIN users u_rep ON i.reported_by_id = u_rep.id
        LEFT JOIN users u_inv ON i.investigation_responsible_id = u_inv.id
        WHERE i.id = ?
    `, id);
    console.log(`[DB:getIncidentById] Incidente encontrado para ID ${id}:`, incident);
    return incident;
}

export async function getAllIncidents() {
    const db = await getDbConnection();
    console.log('[DB:getAllIncidents] Buscando todos os incidentes.');
    const incidents = await db.all(`
        SELECT
            i.id, i.date, i.type, i.severity, i.location_id, l.name as location_name,
            i.status, i.description, i.reported_by_id, u_rep.name as reporter_name,
            i.involved_persons_ids, i.root_cause, i.corrective_actions, i.preventive_actions,
            i.investigation_responsible_id, u_inv.name as investigation_responsible_name,
            i.lost_days, i.cost, i.closure_date
        FROM incidents i
        LEFT JOIN locations l ON i.location_id = l.id
        LEFT JOIN users u_rep ON i.reported_by_id = u_rep.id
        LEFT JOIN users u_inv ON i.investigation_responsible_id = u_inv.id
        ORDER BY i.date DESC
    `);
    console.log(`[DB:getAllIncidents] ${incidents.length} incidentes encontrados.`);
    return incidents;
}

// --- JSA (Job Safety Analysis) ---
interface JsaStepInput { step_order: number; description: string; hazards: string; controls: string; }

export async function insertJsa(jsaData: JsaInputTypeFromAction, stepsData: JsaStepInput[]): Promise<number | undefined> {
    const db = await getDbConnection();
    let jsaId: number | undefined;
    console.log("[DB:insertJsa] Iniciando inserção. Dados da JSA:", jsaData);
    console.log("[DB:insertJsa] Dados das Etapas (se houver):", stepsData);

    const sql = `INSERT INTO jsa (task, location_name, department, responsible_person_name, team_members, required_ppe, status, review_date, attachment_path)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    console.log("[DB:insertJsa] SQL a ser executado:", sql);
    const params = [
        jsaData.task,
        jsaData.locationName ?? null,
        jsaData.department ?? null,
        jsaData.responsiblePersonName ?? null,
        jsaData.teamMembers ?? null,
        jsaData.requiredPpe ?? null,
        jsaData.status ?? 'Rascunho',
        jsaData.reviewDate ?? null,
        jsaData.attachmentPath ?? null
    ];
    console.log("[DB:insertJsa] Parâmetros para SQL (na ordem):", params);

    try {
        await db.run('BEGIN TRANSACTION');
        console.log("[DB:insertJsa] Transação INICIADA.");
        const resultJsa = await db.run(sql, ...params);
        jsaId = resultJsa.lastID;
        console.log("[DB:insertJsa] JSA inserida com ID:", jsaId, "Resultado SQL (JSA):", resultJsa);
        if (!jsaId) {
            console.error("[DB:insertJsa] Falha ao obter ID da JSA inserida. Resultado:", resultJsa);
            throw new Error("Falha ao obter ID da JSA inserida.");
        }

        if (stepsData && stepsData.length > 0) {
            console.log(`[DB:insertJsa] Inserindo ${stepsData.length} etapas para JSA ID: ${jsaId}`);
            const stmtStep = await db.prepare('INSERT INTO jsa_steps (jsa_id, step_order, description, hazards, controls) VALUES (?, ?, ?, ?, ?)');
            for (const step of stepsData) {
                await stmtStep.run(jsaId, step.step_order, step.description, step.hazards, step.controls);
                 console.log(`[DB:insertJsa] Etapa JSA inserida para JSA ID ${jsaId}:`, step);
            }
            await stmtStep.finalize();
            console.log(`[DB:insertJsa] Todas as ${stepsData.length} etapas inseridas com sucesso.`);
        }
        await db.run('COMMIT');
        console.log("[DB:insertJsa] Transação COMMITADA com sucesso para JSA ID:", jsaId);
        return jsaId;
    } catch (error) {
        console.error("[DB:insertJsa] ERRO durante a inserção da JSA. Fazendo ROLLBACK. Erro:", error);
        await db.run('ROLLBACK');
        console.log("[DB:insertJsa] Transação ROLLBACKED.");
        throw error;
    }
}

export async function getAllJsas() {
  const db = await getDbConnection();
  console.log('[DB:getAllJsas] Buscando todas as JSAs.');
  const jsas = await db.all(`
    SELECT j.*
    FROM jsa j
    ORDER BY j.id DESC
  `);
  console.log(`[DB:getAllJsas] ${jsas.length} JSAs encontradas.`);
  return jsas;
}

export async function getJsaSteps(jsaId: number) {
    const db = await getDbConnection();
    console.log(`[DB:getJsaSteps] Buscando etapas para JSA ID: ${jsaId}`);
    const steps = await db.all('SELECT * FROM jsa_steps WHERE jsa_id = ? ORDER BY step_order', jsaId);
    console.log(`[DB:getJsaSteps] ${steps.length} etapas encontradas para JSA ID: ${jsaId}`);
    return steps;
}

// --- Employees ---
export async function insertEmployee(name: string, role?: string | null, department?: string | null, hireDate?: string | null, birthDate?: string | null, rg?: string | null, cpf?: string | null, phone?: string | null, address?: string | null): Promise<number | undefined> {
  const db = await getDbConnection();
  const params = { name, role: role ?? null, department: department ?? null, hireDate: hireDate ?? null, birthDate: birthDate ?? null, rg: rg ?? null, cpf: cpf ?? null, phone: phone ?? null, address: address ?? null };
  console.log("[DB:insertEmployee] Dados para inserção:", params);
  try {
    const result = await db.run('INSERT INTO employees (name, role, department, hire_date, birth_date, rg, cpf, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', params.name, params.role, params.department, params.hireDate, params.birthDate, params.rg, params.cpf, params.phone, params.address);
    console.log("[DB:insertEmployee] Funcionário inserido com sucesso. ID:", result.lastID, "Alterações:", result.changes);
    return result.lastID;
  } catch (error) {
    console.error("[DB:insertEmployee] Erro ao inserir funcionário:", error);
    throw error;
  }
}

export async function getAllEmployees() {
  const db = await getDbConnection();
  console.log("[DB:getAllEmployees] Buscando todos os funcionários (ID e Nome).");
  const employees = await db.all('SELECT id, name FROM employees ORDER BY name');
  console.log(`[DB:getAllEmployees] ${employees.length} funcionários encontrados.`);
  return employees;
}

// --- Locations ---
export async function insertLocation(name: string, description?: string | null, type?: string | null, address?: string | null, contactPerson?: string | null): Promise<number | undefined> {
  const db = await getDbConnection();
  const params = { name, description: description ?? null, type: type ?? null, address: address ?? null, contactPerson: contactPerson ?? null };
  console.log("[DB:insertLocation] Dados para inserção:", params);
  try {
    const result = await db.run('INSERT INTO locations (name, description, type, address, contact_person) VALUES (?, ?, ?, ?, ?)', params.name, params.description, params.type, params.address, params.contactPerson);
    console.log("[DB:insertLocation] Local inserido com sucesso. ID:", result.lastID, "Alterações:", result.changes);
    return result.lastID;
  } catch (error) {
    console.error("[DB:insertLocation] Erro ao inserir local:", error);
    throw error;
  }
}

export async function getAllLocations() {
  const db = await getDbConnection();
  console.log("[DB:getAllLocations] Buscando todos os locais (ID e Nome).");
  const locations = await db.all('SELECT id, name FROM locations ORDER BY name');
  console.log(`[DB:getAllLocations] ${locations.length} locais encontrados.`);
  return locations;
}

// --- Equipment ---
export async function insertEquipment(name: string, type?: string | null, locationId?: number | null, serialNumber?: string | null, brand?: string | null, model?: string | null, acquisitionDate?: string | null, status?: string | null, maintenanceSchedule?: string | null, lastMaintenanceDate?: string | null, nextMaintenanceDate?: string | null): Promise<number | undefined> {
  const db = await getDbConnection();
  const params = { name, type: type ?? null, locationId: locationId ?? null, serialNumber: serialNumber ?? null, brand: brand ?? null, model: model ?? null, acquisitionDate: acquisitionDate ?? null, status: status ?? 'Operacional', maintenanceSchedule: maintenanceSchedule ?? null, lastMaintenanceDate: lastMaintenanceDate ?? null, nextMaintenanceDate: nextMaintenanceDate ?? null };
  console.log("[DB:insertEquipment] Dados para inserção:", params);
  try {
    const result = await db.run('INSERT INTO equipment (name, type, location_id, serial_number, brand, model, acquisition_date, status, maintenance_schedule, last_maintenance_date, next_maintenance_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', params.name, params.type, params.locationId, params.serialNumber, params.brand, params.model, params.acquisitionDate, params.status, params.maintenanceSchedule, params.lastMaintenanceDate, params.nextMaintenanceDate);
    console.log("[DB:insertEquipment] Equipamento inserido com sucesso. ID:", result.lastID, "Alterações:", result.changes);
    return result.lastID;
  } catch (error) {
    console.error("[DB:insertEquipment] Erro ao inserir equipamento:", error);
    throw error;
  }
}

export async function getAllEquipment() {
    const db = await getDbConnection();
    console.log("[DB:getAllEquipment] Buscando todos os equipamentos.");
    const equipment = await db.all('SELECT eq.*, l.name as location_name FROM equipment eq LEFT JOIN locations l ON eq.location_id = l.id ORDER BY eq.name');
    console.log(`[DB:getAllEquipment] ${equipment.length} equipamentos encontrados.`);
    return equipment;
}

// --- Trainings (Courses) ---
export async function insertTraining(courseName: string, description?: string | null, provider?: string | null, durationHours?: number | null, frequencyMonths?: number | null, targetAudience?: string | null, contentOutline?: string | null): Promise<number | undefined> {
  const db = await getDbConnection();
  const params = { courseName, description: description ?? null, provider: provider ?? null, durationHours: durationHours ?? null, frequencyMonths: frequencyMonths === 0 ? 0 : (frequencyMonths ?? null), targetAudience: targetAudience ?? null, contentOutline: contentOutline ?? null };
  console.log("[DB:insertTraining] Dados para inserção:", params);
  try {
    const result = await db.run('INSERT INTO trainings (course_name, description, provider, duration_hours, frequency_months, target_audience, content_outline) VALUES (?, ?, ?, ?, ?, ?, ?)', params.courseName, params.description, params.provider, params.durationHours, params.frequencyMonths, params.targetAudience, params.contentOutline);
    console.log("[DB:insertTraining] Curso inserido com sucesso. ID:", result.lastID, "Alterações:", result.changes);
    return result.lastID;
  } catch (error) {
    console.error("[DB:insertTraining] Erro ao inserir curso:", error);
    throw error;
  }
}

export async function getAllTrainings() {
  const db = await getDbConnection();
  console.log("[DB:getAllTrainings] Buscando todos os cursos (ID e Nome).");
  const trainings = await db.all('SELECT id, course_name FROM trainings ORDER BY course_name');
  console.log(`[DB:getAllTrainings] ${trainings.length} cursos encontrados.`);
  return trainings;
}

// --- Training Records ---
export async function insertTrainingRecord(employeeId: number, trainingId: number, completionDate: string, expiryDate?: string | null, score?: number | null, status?: string | null, certificatePath?: string | null, instructorName?: string | null): Promise<number | undefined> {
  const db = await getDbConnection();
  const params = { employeeId, trainingId, completionDate, expiryDate: expiryDate ?? null, score: score ?? null, status: status ?? 'Concluído', certificatePath: certificatePath ?? null, instructorName: instructorName ?? null };
  console.log("[DB:insertTrainingRecord] Dados para inserção:", params);
  try {
    const result = await db.run('INSERT INTO training_records (employee_id, training_id, completion_date, expiry_date, score, status, certificate_path, instructor_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', params.employeeId, params.trainingId, params.completionDate, params.expiryDate, params.score, params.status, params.certificatePath, params.instructorName);
    console.log("[DB:insertTrainingRecord] Registro de treinamento inserido com sucesso. ID:", result.lastID, "Alterações:", result.changes);
    return result.lastID;
  } catch (error) {
    console.error("[DB:insertTrainingRecord] Erro ao inserir registro de treinamento:", error);
    throw error;
  }
}

export async function getAllTrainingRecords() {
  const db = await getDbConnection();
  console.log("[DB:getAllTrainingRecords] Buscando todos os registros de treinamento.");
  const records = await db.all('SELECT tr.*, e.name as employee_name, t.course_name as training_name FROM training_records tr JOIN employees e ON tr.employee_id = e.id JOIN trainings t ON tr.training_id = t.id ORDER BY tr.completion_date DESC');
  console.log(`[DB:getAllTrainingRecords] ${records.length} registros encontrados.`);
  return records;
}

// --- Documents ---
export async function insertDocument(title: string, description?: string | null, category?: string | null, filePath?: string | null, version?: string | null, reviewDate?: string | null, status?: string | null, jsaId?: number | null, authorId?: number | null, ownerDepartment?: string | null): Promise<number | undefined> {
  const db = await getDbConnection();
  const params = { title, description: description ?? null, category: category ?? null, filePath: filePath ?? null, version: version ?? null, reviewDate: reviewDate ?? null, status: status ?? 'Ativo', jsaId: jsaId ?? null, authorId: authorId ?? null, ownerDepartment: ownerDepartment ?? null };
  console.log("[DB:insertDocument] Dados para inserção:", params);
  try {
    const result = await db.run('INSERT INTO documents (title, description, category, file_path, version, review_date, status, upload_date, jsa_id, author_id, owner_department) VALUES (?, ?, ?, ?, ?, ?, ?, strftime(\'%Y-%m-%d\', \'now\'), ?, ?, ?)', params.title, params.description, params.category, params.filePath, params.version, params.reviewDate, params.status, params.jsaId, params.authorId, params.ownerDepartment);
    console.log("[DB:insertDocument] Documento inserido com sucesso. ID:", result.lastID, "Alterações:", result.changes);
    return result.lastID;
  } catch (error) {
    console.error("[DB:insertDocument] Erro ao inserir documento:", error);
    throw error;
  }
}

export async function getAllDocuments() {
  const db = await getDbConnection();
  console.log("[DB:getAllDocuments] Buscando todos os documentos.");
  const documents = await db.all('SELECT * FROM documents ORDER BY upload_date DESC, title');
  console.log(`[DB:getAllDocuments] ${documents.length} documentos encontrados.`);
  return documents;
}

// --- Users ---
export async function insertUser(name: string, email: string, passwordHash: string, role?: string | null, isActive?: boolean | null): Promise<number | undefined> {
  const db = await getDbConnection();
  const params = { name, email, passwordHash, role: role ?? 'user', isActive: isActive === null || isActive === undefined ? 1 : (isActive ? 1 : 0) };
  console.log("[DB:insertUser] Dados para inserção (parcial - sem hash):", { name: params.name, email: params.email, role: params.role, isActive: params.isActive });
  try {
    const result = await db.run('INSERT INTO users (name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)', params.name, params.email, params.passwordHash, params.role, params.isActive);
    console.log("[DB:insertUser] Usuário inserido com sucesso. ID:", result.lastID, "Alterações:", result.changes);
    return result.lastID;
  } catch (error) {
    console.error("[DB:insertUser] Erro ao inserir usuário:", error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  const db = await getDbConnection();
  console.log(`[DB:getUserByEmail] Buscando usuário com email: ${email}`);
  const user = await db.get('SELECT * FROM users WHERE email = ?', email);
  console.log(`[DB:getUserByEmail] Usuário encontrado para email ${email}:`, user);
  return user;
}

export async function getAllUsers() {
  const db = await getDbConnection();
  console.log("[DB:getAllUsers] Buscando todos os usuários.");
  const users = await db.all('SELECT id, name, email, role, is_active, created_at FROM users ORDER BY name');
  console.log(`[DB:getAllUsers] ${users.length} usuários encontrados.`);
  return users;
}

// --- Audits ---
export async function insertAudit(
    type: string,
    scope: string,
    auditDate: string, // YYYY-MM-DD
    auditor: string,
    leadAuditorId?: number | null,
    status?: string | null
): Promise<number | undefined> {
    const db = await getDbConnection();
    const sql = `INSERT INTO audits (type, scope, audit_date, auditor, lead_auditor_id, status)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [type, scope, auditDate, auditor, leadAuditorId ?? null, status ?? 'Planejada'];
    console.log(`[DB:insertAudit] Executando SQL: ${sql}`);
    console.log(`[DB:insertAudit] Com params:`, params);
    try {
        const result = await db.run(sql, ...params);
        console.log("[DB:insertAudit] Auditoria inserida com sucesso. ID:", result.lastID, "Alterações:", result.changes);
        return result.lastID;
    } catch (error) {
        console.error("[DB:insertAudit] Erro ao inserir auditoria:", error);
        throw error;
    }
}

export async function getAllAudits() {
    const db = await getDbConnection();
    console.log('[DB:getAllAudits] Buscando todas as auditorias.');
    const audits = await db.all(`
      SELECT a.*, u.name as lead_auditor_name
      FROM audits a
      LEFT JOIN users u ON a.lead_auditor_id = u.id
      ORDER BY a.audit_date DESC
    `);
    console.log(`[DB:getAllAudits] ${audits.length} auditorias encontradas.`);
    return audits;
}


// --- Activity Logs ---
export async function insertActivityLog(action: string, details?: string | null, userId?: number | null): Promise<number | undefined> {
  const db = await getDbConnection();
  try {
    const result = await db.run('INSERT INTO activity_logs (action, details, user_id) VALUES (?, ?, ?)', action, details ?? null, userId ?? null);
    // console.log("[DB:insertActivityLog] Log de atividade inserido. ID:", result.lastID); // Frequent, so commented out
    return result.lastID;
  } catch (error) {
    console.error("[DB:insertActivityLog] Erro ao inserir log de atividade:", error);
    throw error;
  }
}

export async function getAllActivityLogs(limit: number = 50) {
    const db = await getDbConnection();
    console.log(`[DB:getAllActivityLogs] Buscando os últimos ${limit} logs de atividade.`);
    const logs = await db.all('SELECT al.*, u.name as user_name FROM activity_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.timestamp DESC LIMIT ?', limit);
    console.log(`[DB:getAllActivityLogs] ${logs.length} logs encontrados.`);
    return logs;
}

// --- Action Plans ---
export async function getDashboardActionItems(statusFilter?: string[], limit?: number): Promise<any[]> {
    const db = await getDbConnection();
    let whereClause = '';
    const params: any[] = [];
    if (statusFilter && statusFilter.length > 0) {
        whereClause = `WHERE ap.status IN (${statusFilter.map(() => '?').join(',')})`;
        params.push(...statusFilter);
    }
    let limitClause = '';
    if (limit) {
        limitClause = 'LIMIT ?';
        params.push(limit);
    }
    console.log(`[DB:getDashboardActionItems] Buscando itens do plano de ação com filtro: ${statusFilter}, limite: ${limit}`);
    const items = await db.all(`SELECT ap.*, u.name as responsible_name FROM action_plans ap LEFT JOIN users u ON ap.responsible_id = u.id ${whereClause} ORDER BY CASE ap.priority WHEN 'Alta' THEN 1 WHEN 'Média' THEN 2 WHEN 'Baixa' THEN 3 ELSE 4 END, ap.due_date ASC ${limitClause}`, ...params);
    console.log(`[DB:getDashboardActionItems] ${items.length} itens encontrados.`);
    return items;
}

export async function getAllActionItemsSortedByDueDate(): Promise<any[]> {
    const db = await getDbConnection();
    console.log('[DB:getAllActionItemsSortedByDueDate] Buscando todos os itens do plano de ação ordenados por data de vencimento.');
    const items = await db.all(`SELECT ap.*, u.name as responsible_name FROM action_plans ap LEFT JOIN users u ON ap.responsible_id = u.id ORDER BY CASE WHEN ap.status = 'Concluída' OR ap.status = 'Cancelada' THEN 1 ELSE 0 END, ap.due_date ASC`);
    console.log(`[DB:getAllActionItemsSortedByDueDate] ${items.length} itens encontrados.`);
    return items;
}

// --- KPIs ---
export async function insertKpi(name: string, value: number, category?: string, unit?: string, target?: number, period?: string, data_date?: string) {
  const db = await getDbConnection();
  console.log("[DB:insertKpi] Dados para inserção/atualização:", {name, value, category, unit, target, period, data_date});
  try {
    const result = await db.run(
      'INSERT INTO kpis (name, value, category, unit, target, period, data_date, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(name) DO UPDATE SET value=excluded.value, category=excluded.category, unit=excluded.unit, target=excluded.target, period=excluded.period, data_date=excluded.data_date, updated_at=CURRENT_TIMESTAMP',
      name, value, category ?? null, unit ?? null, target ?? null, period ?? null, data_date ?? null
    );
    console.log("[DB:insertKpi] KPI inserido/atualizado com sucesso. ID:", result.lastID, "Alterações:", result.changes);
    return result.lastID;
  } catch (error) {
    console.error("[DB:insertKpi] Erro ao inserir/atualizar KPI:", error);
    throw error;
  }
}

export async function getAllKpis() {
  const db = await getDbConnection();
  console.log("[DB:getAllKpis] Buscando todos os KPIs.");
  const kpis = await db.all('SELECT * FROM kpis ORDER BY category, name');
  console.log(`[DB:getAllKpis] ${kpis.length} KPIs encontrados.`);
  return kpis;
}

