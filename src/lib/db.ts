
// src/lib/db.ts
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

// Variável global para armazenar a conexão do banco de dados
let db: Database | null = null;

/**
 * Abre e retorna a conexão com o banco de dados SQLite.
 * Cria o banco de dados e as tabelas se não existirem.
 */
export async function getDbConnection(): Promise<Database> {
  if (db) {
    return db;
  }

  // Abre a conexão com o banco de dados (cria o arquivo se não existir)
  db = await open({
    filename: './ehs_database.sqlite', // Nome do arquivo do banco de dados
    driver: sqlite3.Database,
  });

  console.log('Conexão com SQLite estabelecida.');

  // Criar tabelas se não existirem
  await db.exec(`
    -- Tabela Geral: Funcionários
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT,
      department TEXT,
      hire_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela Geral: Locais
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      type TEXT, -- e.g., 'Escritório', 'Fábrica', 'Armazém'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela Geral: Equipamentos
    CREATE TABLE IF NOT EXISTS equipment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT,
      location_id INTEGER,
      serial_number TEXT UNIQUE,
      maintenance_schedule TEXT,
      last_maintenance_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id)
    );

    -- Tabela Geral: Treinamentos (Cursos)
    CREATE TABLE IF NOT EXISTS trainings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_name TEXT NOT NULL UNIQUE,
      description TEXT,
      provider TEXT,
      duration_hours INTEGER,
      frequency_months INTEGER, -- Periodicidade para reciclagem
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela Geral: Registros de Treinamento
    CREATE TABLE IF NOT EXISTS training_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      training_id INTEGER NOT NULL,
      completion_date DATE NOT NULL,
      expiry_date DATE,
      score REAL,
      certificate_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      FOREIGN KEY (training_id) REFERENCES trainings(id)
    );

    -- Tabela Geral: Documentos
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      file_path TEXT, -- Path or Link to the document
      version TEXT,
      upload_date DATE DEFAULT CURRENT_DATE,
      review_date DATE,
      status TEXT DEFAULT 'Ativo', -- e.g., 'Ativo', 'Obsoleto', 'Em Revisão'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

     -- Tabela Geral: Usuários (para controle de acesso futuro)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user', -- e.g., 'admin', 'manager', 'user'
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela Geral: Logs de Atividade
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL, -- e.g., 'CREATE_RISK', 'UPDATE_INCIDENT'
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );


    -- Tabela Segurança: KPIs (já existente, mas garantindo)
    CREATE TABLE IF NOT EXISTS kpis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE, -- Garantir nome único
      value REAL NOT NULL,
      category TEXT,
      unit TEXT, -- e.g., 'número', 'taxa', '%', 'dias', 'R$'
      target REAL, -- Meta
      period TEXT, -- e.g., 'Mensal', 'Anual'
      data_date DATE, -- Data a que o KPI se refere
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );


    -- Tabela Segurança: Análise de Riscos
    CREATE TABLE IF NOT EXISTS risks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      location_id INTEGER,
      activity TEXT,
      hazard_type TEXT, -- e.g., 'Físico', 'Químico', 'Biológico', 'Ergonômico', 'Acidente'
      probability INTEGER, -- e.g., 1 a 5
      severity INTEGER, -- e.g., 1 a 5
      risk_level INTEGER, -- Calculado: probability * severity
      control_measures TEXT,
      responsible_person TEXT,
      status TEXT DEFAULT 'Aberto', -- e.g., 'Aberto', 'Em Andamento', 'Controlado', 'Mitigado'
      review_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id)
    );

    -- Tabela Segurança: Incidentes (já existente, mas garantindo)
    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      date TEXT NOT NULL, -- Manter como TEXT por enquanto, ou mudar para DATETIME
      type TEXT NOT NULL, -- 'Acidente com Afastamento', 'Acidente sem Afastamento', 'Quase Acidente', 'Incidente Ambiental'
      severity TEXT, -- 'Leve', 'Moderado', 'Grave', 'Fatalidade', 'Insignificante' (para ambiental)
      location_id INTEGER,
      involved_persons TEXT, -- Pode ser JSON ou IDs de funcionários
      root_cause TEXT,
      corrective_actions TEXT,
      lost_days INTEGER DEFAULT 0,
      cost REAL DEFAULT 0.0,
      reported_by_id INTEGER,
      status TEXT DEFAULT 'Aberto', -- e.g., 'Aberto', 'Em Investigação', 'Aguardando Ação', 'Fechado'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id),
      FOREIGN KEY (reported_by_id) REFERENCES users(id) -- Ou employees(id)
    );

    -- Tabela Segurança: Auditorias
    CREATE TABLE IF NOT EXISTS audits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL, -- e.g., 'Interna', 'Externa', 'Comportamental'
      scope TEXT NOT NULL, -- Área ou processo auditado
      audit_date DATE NOT NULL,
      auditor TEXT NOT NULL,
      findings TEXT, -- Resumo dos achados
      non_conformities_count INTEGER DEFAULT 0,
      observations_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Planejada', -- e.g., 'Planejada', 'Em Andamento', 'Concluída', 'Cancelada'
      report_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

     -- Tabela Segurança: Não Conformidades/Observações de Auditoria
    CREATE TABLE IF NOT EXISTS audit_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      audit_id INTEGER NOT NULL,
      type TEXT NOT NULL, -- 'Não Conformidade', 'Observação', 'Oportunidade de Melhoria'
      description TEXT NOT NULL,
      severity TEXT, -- e.g., 'Maior', 'Menor'
      related_requirement TEXT, -- Norma ou requisito relacionado
      action_plan_id INTEGER, -- Link para plano de ação
      status TEXT DEFAULT 'Aberta', -- e.g., 'Aberta', 'Em Análise', 'Ação Definida', 'Concluída', 'Verificada'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (audit_id) REFERENCES audits(id),
      FOREIGN KEY (action_plan_id) REFERENCES action_plans(id)
    );

    -- Tabela Segurança: Permissões de Trabalho
    CREATE TABLE IF NOT EXISTS work_permits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL, -- e.g., 'Trabalho a Quente', 'Espaço Confinado', 'Trabalho em Altura'
      location_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      requester_id INTEGER NOT NULL,
      approver_id INTEGER,
      start_datetime DATETIME NOT NULL,
      end_datetime DATETIME NOT NULL,
      precautions TEXT,
      status TEXT DEFAULT 'Solicitada', -- e.g., 'Solicitada', 'Aprovada', 'Rejeitada', 'Em Andamento', 'Concluída', 'Expirada'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id),
      FOREIGN KEY (requester_id) REFERENCES users(id), -- Ou employees(id)
      FOREIGN KEY (approver_id) REFERENCES users(id) -- Ou employees(id)
    );

    -- Tabela Segurança: EPIs (Tipos)
    CREATE TABLE IF NOT EXISTS ppe_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE, -- e.g., 'Capacete', 'Luva Nitrílica', 'Óculos de Segurança'
      specification TEXT,
      lifespan_months INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela Segurança: Registros de Entrega de EPIs
    CREATE TABLE IF NOT EXISTS ppe_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      ppe_type_id INTEGER NOT NULL,
      delivery_date DATE NOT NULL,
      quantity INTEGER DEFAULT 1,
      ca_number TEXT, -- Certificado de Aprovação (CA)
      receipt_signed BOOLEAN DEFAULT FALSE, -- Confirmação de recebimento
      return_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      FOREIGN KEY (ppe_type_id) REFERENCES ppe_types(id)
    );

    -- Tabela Segurança: Plano de Ação
    CREATE TABLE IF NOT EXISTS action_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      origin TEXT, -- e.g., 'Incidente ID 123', 'Auditoria ID 45', 'Risco ID 67'
      responsible_id INTEGER NOT NULL,
      due_date DATE NOT NULL,
      priority TEXT DEFAULT 'Média', -- e.g., 'Alta', 'Média', 'Baixa'
      status TEXT DEFAULT 'Aberta', -- e.g., 'Aberta', 'Em Andamento', 'Concluída', 'Atrasada', 'Cancelada'
      completion_date DATE,
      evidence TEXT, -- Descrição ou link para evidência
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (responsible_id) REFERENCES users(id) -- Ou employees(id)
    );

    -- Tabela Segurança: Ações Trabalhistas
    CREATE TABLE IF NOT EXISTS legal_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_number TEXT UNIQUE,
      claimant_name TEXT, -- Nome do reclamante (pode ser ex-funcionário)
      subject TEXT, -- e.g., 'Insalubridade', 'Acidente de Trabalho', 'Doença Ocupacional'
      status TEXT DEFAULT 'Em Andamento', -- e.g., 'Em Andamento', 'Acordo', 'Sentença', 'Arquivado'
      filed_date DATE,
      court TEXT, -- Vara do trabalho
      company_lawyer TEXT,
      estimated_cost REAL,
      final_cost REAL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );


    -- Tabela Saúde: ASOs (Atestados de Saúde Ocupacional)
    CREATE TABLE IF NOT EXISTS asos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      type TEXT NOT NULL, -- 'Admissional', 'Periódico', 'Retorno ao Trabalho', 'Mudança de Função', 'Demissional'
      exam_date DATE NOT NULL,
      result TEXT NOT NULL, -- 'Apto', 'Inapto', 'Apto com Restrições'
      restrictions TEXT, -- Se Apto com Restrições
      doctor_name TEXT,
      crm TEXT, -- CRM do médico
      clinic_name TEXT,
      next_exam_due_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    -- Tabela Saúde: Doenças Ocupacionais
    CREATE TABLE IF NOT EXISTS occupational_diseases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      disease_name TEXT NOT NULL,
      cid TEXT, -- Código Internacional de Doenças
      diagnosis_date DATE,
      related_activity TEXT, -- Atividade suspeita de causar a doença
      cat_issued BOOLEAN DEFAULT FALSE, -- Comunicação de Acidente de Trabalho emitida?
      status TEXT DEFAULT 'Suspeita', -- e.g., 'Suspeita', 'Confirmada', 'Afastado', 'Retornado'
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

     -- Tabela Saúde: Absenteísmo (Registros específicos se necessário, ou calcular a partir de outras tabelas)
    CREATE TABLE IF NOT EXISTS absenteeism_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      reason TEXT NOT NULL, -- e.g., 'Doença Comum', 'Doença Ocupacional', 'Acidente Trabalho', 'Licença Médica'
      medical_certificate_code TEXT, -- CID ou código do atestado
      lost_hours REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );


    -- Tabela Saúde: Monitoramento de Agentes (Resultados de medições)
    CREATE TABLE IF NOT EXISTS agent_monitoring (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location_id INTEGER,
      ghe_id INTEGER, -- Grupo Homogêneo de Exposição (se aplicável)
      agent_type TEXT NOT NULL, -- 'Ruído', 'Calor', 'Poeira Sílica', 'Benzeno', etc.
      measurement_date DATE NOT NULL,
      measurement_value REAL NOT NULL,
      unit TEXT NOT NULL, -- 'dB(A)', '°C IBUTG', 'mg/m³'
      legal_limit REAL, -- Limite de tolerância
      action_level REAL, -- Nível de ação
      instrument TEXT, -- Equipamento usado
      responsible_technician TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id)
      -- FOREIGN KEY (ghe_id) REFERENCES ghes(id) -- Se tiver tabela de GHEs
    );

    -- Tabela Saúde: Avaliações Psicossociais (Resultados agregados ou individuais com controle de privacidade)
    CREATE TABLE IF NOT EXISTS psychosocial_evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      evaluation_date DATE NOT NULL,
      type TEXT, -- e.g., 'Pesquisa de Clima', 'Avaliação de Estresse', 'Aplicação de Questionário Específico'
      target_group TEXT, -- e.g., 'Departamento X', 'Empresa Toda', 'Função Y'
      overall_score REAL,
      key_findings TEXT, -- Principais pontos identificados (anonimizado se individual)
      recommendations TEXT,
      report_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela Saúde: Registros de Vacinação (Individual)
    CREATE TABLE IF NOT EXISTS vaccination_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      vaccine_name TEXT NOT NULL, -- e.g., 'Hepatite B', 'Tétano', 'Gripe'
      dose TEXT, -- e.g., '1ª Dose', '2ª Dose', 'Reforço'
      vaccination_date DATE NOT NULL,
      batch_number TEXT,
      provider TEXT, -- Onde foi aplicada
      next_due_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );


    -- Tabela Meio Ambiente: Geração de Resíduos
    CREATE TABLE IF NOT EXISTS waste_generation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL,
      location_id INTEGER,
      waste_type TEXT NOT NULL, -- e.g., 'Papel', 'Plástico', 'Orgânico', 'Metal', 'Resíduo Perigoso Classe I'
      classification TEXT, -- e.g., 'Reciclável', 'Não Reciclável', 'Perigoso'
      quantity REAL NOT NULL,
      unit TEXT NOT NULL, -- 'kg', 't', 'm³'
      destination TEXT, -- e.g., 'Aterro Sanitário', 'Reciclagem Co.', 'Incineração'
      mrf_number TEXT, -- Número do Manifesto de Transporte de Resíduos (se aplicável)
      cost REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id)
    );

     -- Tabela Meio Ambiente: Consumo de Água
    CREATE TABLE IF NOT EXISTS water_consumption (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL, -- Ou Mês/Ano
      location_id INTEGER,
      reading REAL NOT NULL,
      unit TEXT DEFAULT 'm³',
      source TEXT DEFAULT 'Rede Pública', -- e.g., 'Rede Pública', 'Poço Artesiano'
      cost REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id)
    );

    -- Tabela Meio Ambiente: Consumo de Energia
    CREATE TABLE IF NOT EXISTS energy_consumption (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL, -- Ou Mês/Ano
      location_id INTEGER,
      reading REAL NOT NULL,
      unit TEXT DEFAULT 'kWh',
      source TEXT DEFAULT 'Rede Elétrica', -- e.g., 'Rede Elétrica', 'Solar Fotovoltaica', 'Gerador Diesel'
      cost REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id)
    );

    -- Tabela Meio Ambiente: Emissões de GEE (Gases de Efeito Estufa) - Pode ser calculada ou registrada
    CREATE TABLE IF NOT EXISTS ghg_emissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL, -- Ou Mês/Ano
      location_id INTEGER,
      source_type TEXT NOT NULL, -- e.g., 'Consumo Energia Elétrica', 'Combustível Frota', 'Processo Industrial'
      emission_factor REAL,
      activity_data REAL NOT NULL, -- e.g., kWh consumido, Litros de diesel
      activity_unit TEXT NOT NULL,
      co2e_emission REAL NOT NULL, -- Emissão calculada em CO₂ equivalente
      unit TEXT DEFAULT 'tCO₂e',
      scope INTEGER, -- 1, 2 ou 3
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id)
    );

    -- Tabela Meio Ambiente: Derrames e Vazamentos (ligada a Incidentes ou separada)
    -- Reutilizando a tabela 'incidents' com tipo 'Incidente Ambiental' ou criando uma específica:
    CREATE TABLE IF NOT EXISTS environmental_incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      incident_id INTEGER UNIQUE, -- Link opcional para a tabela geral de incidentes
      date DATETIME NOT NULL,
      location_id INTEGER,
      type TEXT NOT NULL, -- 'Derrame', 'Vazamento', 'Emissão não controlada'
      substance TEXT NOT NULL, -- Produto envolvido
      quantity REAL,
      unit TEXT,
      affected_area TEXT, -- e.g., 'Solo', 'Água', 'Ar'
      immediate_actions TEXT,
      cleanup_status TEXT DEFAULT 'Em Andamento',
      reporting_status TEXT, -- e.g., 'Reportado ao Órgão Ambiental'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (incident_id) REFERENCES incidents(id),
      FOREIGN KEY (location_id) REFERENCES locations(id)
    );


    -- Tabela Meio Ambiente: Autos de Infração Ambiental
    CREATE TABLE IF NOT EXISTS environmental_infractions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      infraction_number TEXT UNIQUE NOT NULL,
      issuing_body TEXT NOT NULL, -- e.g., 'IBAMA', 'Secretaria Estadual Meio Ambiente'
      issue_date DATE NOT NULL,
      description TEXT NOT NULL, -- Motivo da autuação
      legal_basis TEXT, -- Artigo/Lei infringido
      fine_amount REAL,
      status TEXT DEFAULT 'Em Análise', -- e.g., 'Em Análise', 'Recurso', 'Paga', 'Termo de Ajuste'
      defense_deadline DATE,
      resolution TEXT, -- Como foi resolvida
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela Meio Ambiente: Inventário Químico
    CREATE TABLE IF NOT EXISTS chemical_inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT NOT NULL,
      cas_number TEXT, -- Chemical Abstracts Service number
      location_id INTEGER NOT NULL,
      storage_area TEXT,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL, -- 'L', 'kg', 'gal'
      hazard_class TEXT, -- GHS classification
      sds_path TEXT, -- Path to Safety Data Sheet (FDS)
      last_updated DATE DEFAULT CURRENT_DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id)
    );

  `);

  console.log('Tabelas SQLite verificadas/criadas com sucesso.');

  return db;
}

/**
 * Fecha a conexão com o banco de dados.
 */
export async function closeDbConnection(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
    console.log('Conexão com SQLite fechada.');
  }
}

// --- Funções CRUD de Exemplo (Adapte e crie mais conforme necessário) ---

// Exemplo: Inserir um novo KPI
export async function insertKpi(name: string, value: number, category?: string, unit?: string, target?: number, period?: string, data_date?: string) {
  const db = await getDbConnection();
  const result = await db.run(
    'INSERT INTO kpis (name, value, category, unit, target, period, data_date, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(name) DO UPDATE SET value=excluded.value, category=excluded.category, unit=excluded.unit, target=excluded.target, period=excluded.period, data_date=excluded.data_date, updated_at=CURRENT_TIMESTAMP',
    name, value, category ?? null, unit ?? null, target ?? null, period ?? null, data_date ?? null
  );
  return result.lastID ?? (await db.get('SELECT id FROM kpis WHERE name = ?', name))?.id;
}

// Exemplo: Buscar todos os KPIs
export async function getAllKpis() {
  const db = await getDbConnection();
  const kpis = await db.all('SELECT * FROM kpis ORDER BY category, name');
  return kpis;
}

// Exemplo: Inserir um Incidente
export async function insertIncident(description: string, date: string, type: string, severity?: string, locationId?: number, reportedById?: number) {
    const db = await getDbConnection();
    const result = await db.run(
        'INSERT INTO incidents (description, date, type, severity, location_id, reported_by_id) VALUES (?, ?, ?, ?, ?, ?)',
        description, date, type, severity ?? null, locationId ?? null, reportedById ?? null
    );
    return result.lastID;
}

// Exemplo: Buscar todos Incidentes
export async function getAllIncidents() {
    const db = await getDbConnection();
    // Exemplo de JOIN para buscar nome do local e do reportador (se aplicável)
    const incidents = await db.all(`
        SELECT i.*, l.name as location_name, u.name as reporter_name
        FROM incidents i
        LEFT JOIN locations l ON i.location_id = l.id
        LEFT JOIN users u ON i.reported_by_id = u.id
        ORDER BY i.date DESC
    `);
    return incidents;
}

// Adicione mais funções CRUD para as outras tabelas (Risks, Audits, PPE, etc.)
// Exemplo: insertRisk, getAllRisks, insertAudit, getAllAudits...

// Exemplo: Inserir Risco
export async function insertRisk(description: string, probability: number, severity: number, locationId?: number, activity?: string, hazardType?: string, controlMeasures?: string, responsiblePerson?: string, reviewDate?: string) {
  const db = await getDbConnection();
  const riskLevel = probability * severity;
  const result = await db.run(
    'INSERT INTO risks (description, probability, severity, risk_level, location_id, activity, hazard_type, control_measures, responsible_person, review_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    description, probability, severity, riskLevel, locationId ?? null, activity ?? null, hazardType ?? null, controlMeasures ?? null, responsiblePerson ?? null, reviewDate ?? null
  );
  return result.lastID;
}

// Exemplo: Buscar todos Riscos
export async function getAllRisks() {
  const db = await getDbConnection();
  const risks = await db.all(`
    SELECT r.*, l.name as location_name
    FROM risks r
    LEFT JOIN locations l ON r.location_id = l.id
    ORDER BY r.risk_level DESC, r.created_at DESC
  `);
  return risks;
}

// ... (Implementar funções CRUD para as demais tabelas: audits, work_permits, ppe_types, ppe_records, action_plans, legal_actions, asos, etc.)
