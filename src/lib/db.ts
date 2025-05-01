// src/lib/db.ts
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

// Variável global para armazenar a conexão do banco de dados
let db: Database | null = null;

/**
 * Abre e retorna a conexão com o banco de dados SQLite.
 * Cria o banco de dados e as tabelas se não existirem.
 * Popula com dados de exemplo se as tabelas estiverem vazias.
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

  // Habilitar chaves estrangeiras (importante para integridade relacional)
  await db.run('PRAGMA foreign_keys = ON');


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
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL -- Optionally set null if location is deleted
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
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE, -- Delete records if employee is deleted
      FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE CASCADE -- Delete records if training is deleted
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

     -- Tabela Segurança: JSA (Job Safety Analysis) - Mover para antes de Documents
    CREATE TABLE IF NOT EXISTS jsa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task TEXT NOT NULL, -- Tarefa analisada
      location_id INTEGER,
      department TEXT,
      responsible_person_id INTEGER, -- ID do elaborador/revisor
      team_members TEXT, -- Nomes dos participantes (texto)
      required_ppe TEXT, -- EPIs necessários (texto)
      status TEXT DEFAULT 'Rascunho', -- e.g., 'Rascunho', 'Ativo', 'Revisado', 'Obsoleto'
      creation_date DATE DEFAULT CURRENT_DATE,
      review_date DATE, -- Data da última revisão
      attachment_path TEXT, -- Caminho para o arquivo Excel anexado
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
      FOREIGN KEY (responsible_person_id) REFERENCES users(id) ON DELETE SET NULL
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
      jsa_id INTEGER, -- Chave estrangeira opcional para JSA
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (jsa_id) REFERENCES jsa(id) ON DELETE SET NULL -- Se a JSA for deletada, o documento fica sem associação
    );


    -- Tabela Geral: Logs de Atividade
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL, -- e.g., 'CREATE_JSA', 'UPDATE_INCIDENT'
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
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

    -- Tabela Segurança: Passos da JSA
    CREATE TABLE IF NOT EXISTS jsa_steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jsa_id INTEGER NOT NULL,
        step_order INTEGER NOT NULL, -- Ordem do passo
        description TEXT NOT NULL, -- Descrição do passo da tarefa
        hazards TEXT NOT NULL, -- Perigos identificados para o passo
        controls TEXT NOT NULL, -- Medidas de controle para os perigos
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (jsa_id) REFERENCES jsa(id) ON DELETE CASCADE -- Exclui os passos se a JSA for excluída
    );

    -- Tabela Segurança: Incidentes (já existente, mas garantindo)
    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      date TEXT NOT NULL, -- Manter como TEXT por enquanto, ou mudar para DATETIME
      type TEXT NOT NULL, -- 'Acidente com Afastamento', 'Acidente sem Afastamento', 'Quase Acidente', 'Incidente Ambiental'
      severity TEXT, -- 'Leve', 'Moderado', 'Grave', 'Fatalidade', 'Insignificante' (para ambiental)
      location_id INTEGER,
      involved_persons_ids TEXT, -- Storing IDs as comma-separated string or JSON
      root_cause TEXT,
      corrective_actions TEXT,
      lost_days INTEGER DEFAULT 0,
      cost REAL DEFAULT 0.0,
      reported_by_id INTEGER,
      status TEXT DEFAULT 'Aberto', -- e.g., 'Aberto', 'Em Investigação', 'Aguardando Ação', 'Fechado'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
      FOREIGN KEY (reported_by_id) REFERENCES users(id) ON DELETE SET NULL -- Ou employees(id)
    );

     -- Tabela Segurança: Plano de Ação - Mover para antes de Audit Items
    CREATE TABLE IF NOT EXISTS action_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      origin TEXT, -- e.g., 'Incidente ID 123', 'Auditoria ID 45', 'JSA ID 67'
      responsible_id INTEGER, -- Allow NULL initially
      due_date DATE,
      priority TEXT DEFAULT 'Média', -- e.g., 'Alta', 'Média', 'Baixa'
      status TEXT DEFAULT 'Aberta', -- e.g., 'Aberta', 'Em Andamento', 'Concluída', 'Atrasada', 'Cancelada'
      completion_date DATE,
      evidence TEXT, -- Descrição ou link para evidência
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (responsible_id) REFERENCES users(id) ON DELETE SET NULL -- Changed to SET NULL
    );


    -- Tabela Segurança: Auditorias
    CREATE TABLE IF NOT EXISTS audits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL, -- e.g., 'Interna', 'Externa', 'Comportamental'
      scope TEXT NOT NULL, -- Área ou processo auditado
      audit_date DATE NOT NULL,
      auditor TEXT NOT NULL, -- Could link to users/employees if needed
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
      FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE, -- Delete items if audit is deleted
      FOREIGN KEY (action_plan_id) REFERENCES action_plans(id) ON DELETE SET NULL -- Keep action plan even if audit item is deleted? Or CASCADE?
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
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT, -- Prevent deleting location if permits exist? Or SET NULL?
      FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE RESTRICT, -- Or employees(id)
      FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE RESTRICT -- Or employees(id)
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
      due_date DATE, -- Calculated or set manually based on lifespan
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (ppe_type_id) REFERENCES ppe_types(id) ON DELETE RESTRICT -- Prevent deleting type if records exist? Or CASCADE?
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
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
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
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
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
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
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
      responsible_technician_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
      FOREIGN KEY (responsible_technician_id) REFERENCES users(id) ON DELETE SET NULL
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
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
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
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
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
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
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
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
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
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
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
      FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE SET NULL,
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
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
      location_id INTEGER, -- Allow NULL initially
      storage_area TEXT,
      quantity REAL,
      unit TEXT, -- 'L', 'kg', 'gal'
      hazard_class TEXT, -- GHS classification
      sds_path TEXT, -- Path to Safety Data Sheet (FDS)
      last_updated DATE DEFAULT CURRENT_DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL -- Changed to SET NULL
    );

  `);

  console.log('Tabelas SQLite verificadas/criadas com sucesso.');

  // -- POPULAR COM DADOS DE EXEMPLO --
  // Use INSERT OR IGNORE to avoid errors if data already exists (e.g., on hot reload)

  // Sample Users
  await db.run('INSERT OR IGNORE INTO users (id, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)', 1, 'Admin EHS', 'admin@ehscontrol.com', '$2a$10$dummyhashadmin', 'admin', TRUE); // Replace with real hash
  await db.run('INSERT OR IGNORE INTO users (id, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)', 2, 'Gerente Seg', 'gerente.seg@company.com', '$2a$10$dummyhashmanager', 'manager', TRUE);
  await db.run('INSERT OR IGNORE INTO users (id, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)', 3, 'Técnico SST', 'tecnico.sst@company.com', '$2a$10$dummyhashuser', 'user', TRUE);
  await db.run('INSERT OR IGNORE INTO users (id, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)', 4, 'Bianco Fialho', 'biancofialho@gmail.com', '$2a$10$mY4C4mN3/8wFfO60V.sR6eJ9F0o/qA3mR7K9Q8B1Z6v7J3k9D2c.a', 'admin', TRUE); // Senha '1234'
  await db.run('INSERT OR IGNORE INTO users (id, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)', 5, 'Usuário Inativo', 'inativo@company.com', '$2a$10$dummyhashinactive', 'user', FALSE);
  await db.run('INSERT OR IGNORE INTO users (id, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)', 6, 'Alice Silva (Usuário)', 'alice@company.com', '$2a$10$dummyhashalice', 'user', TRUE);
  await db.run('INSERT OR IGNORE INTO users (id, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)', 7, 'Bruno Costa (Usuário)', 'bruno@company.com', '$2a$10$dummyhashbruno', 'user', TRUE);


  // Sample Locations
  await db.run('INSERT OR IGNORE INTO locations (id, name, description, type) VALUES (?, ?, ?, ?)', 1, 'Fábrica - Setor A', 'Área de produção principal', 'Fábrica');
  await db.run('INSERT OR IGNORE INTO locations (id, name, description, type) VALUES (?, ?, ?, ?)', 2, 'Almoxarifado Central', 'Armazenamento de materiais', 'Armazém');
  await db.run('INSERT OR IGNORE INTO locations (id, name, description, type) VALUES (?, ?, ?, ?)', 3, 'Escritório - RH', 'Recursos Humanos', 'Escritório');
  await db.run('INSERT OR IGNORE INTO locations (id, name, description, type) VALUES (?, ?, ?, ?)', 4, 'Laboratório Químico', 'Análises e testes', 'Laboratório');
  await db.run('INSERT OR IGNORE INTO locations (id, name, description, type) VALUES (?, ?, ?, ?)', 5, 'Pátio Externo', 'Área de carga e descarga', 'Externo');
  await db.run('INSERT OR IGNORE INTO locations (id, name, description, type) VALUES (?, ?, ?, ?)', 6, 'Fábrica - Telhado', 'Telhado do bloco principal', 'Fábrica');
  await db.run('INSERT OR IGNORE INTO locations (id, name, description, type) VALUES (?, ?, ?, ?)', 7, 'Oficina Manutenção', 'Manutenção Mecânica/Elétrica', 'Oficina');

  // Sample Employees
  await db.run('INSERT OR IGNORE INTO employees (id, name, role, department, hire_date) VALUES (?, ?, ?, ?, ?)', 1, 'Alice Silva', 'Operadora', 'Produção', '2022-03-15');
  await db.run('INSERT OR IGNORE INTO employees (id, name, role, department, hire_date) VALUES (?, ?, ?, ?, ?)', 2, 'Bruno Costa', 'Técnico Manutenção', 'Manutenção', '2021-08-01');
  await db.run('INSERT OR IGNORE INTO employees (id, name, role, department, hire_date) VALUES (?, ?, ?, ?, ?)', 3, 'Carlos Dias', 'Almoxarife', 'Logística', '2023-01-10');
  await db.run('INSERT OR IGNORE INTO employees (id, name, role, department, hire_date) VALUES (?, ?, ?, ?, ?)', 4, 'Diana Souza', 'Analista RH', 'RH', '2020-11-20');
  await db.run('INSERT OR IGNORE INTO employees (id, name, role, department, hire_date) VALUES (?, ?, ?, ?, ?)', 5, 'Eduardo Lima', 'Químico', 'Laboratório', '2022-05-05');

  // Sample Equipment
  await db.run('INSERT OR IGNORE INTO equipment (id, name, type, location_id, serial_number, maintenance_schedule) VALUES (?, ?, ?, ?, ?, ?)', 1, 'Extintor CO2 #1', 'Extintor', 1, 'EXT-001', 'Inspeção Mensal, Recarga Anual');
  await db.run('INSERT OR IGNORE INTO equipment (id, name, type, location_id, serial_number, maintenance_schedule) VALUES (?, ?, ?, ?, ?, ?)', 2, 'Prensa Hidráulica P-10', 'Máquina', 1, 'PH-10-SN123', 'Lubrificação Semanal, Inspeção Trimestral');
  await db.run('INSERT OR IGNORE INTO equipment (id, name, type, location_id, serial_number, maintenance_schedule) VALUES (?, ?, ?, ?, ?, ?)', 3, 'Empilhadeira E-02', 'Veículo', 2, 'EMP-02-SN456', 'Checklist Diário, Revisão Semestral');
  await db.run('INSERT OR IGNORE INTO equipment (id, name, type, location_id, serial_number, maintenance_schedule) VALUES (?, ?, ?, ?, ?, ?)', 4, 'Capela Exaustão Lab', 'Equipamento Lab.', 4, 'CAP-LAB-SN789', 'Verificação Fluxo Mensal, Limpeza Semestral');

  // Sample Trainings (Courses)
  await db.run('INSERT OR IGNORE INTO trainings (id, course_name, description, provider, duration_hours, frequency_months) VALUES (?, ?, ?, ?, ?, ?)', 1, 'NR-35 Trabalho em Altura', 'Capacitação para trabalhos acima de 2m', 'Consultoria Segura', 8, 24);
  await db.run('INSERT OR IGNORE INTO trainings (id, course_name, description, provider, duration_hours, frequency_months) VALUES (?, ?, ?, ?, ?, ?)', 2, 'NR-33 Espaços Confinados (Vigia/Trabalhador)', 'Entrada e trabalho em espaços confinados', 'TreinaEHS', 16, 12);
  await db.run('INSERT OR IGNORE INTO trainings (id, course_name, description, provider, duration_hours, frequency_months) VALUES (?, ?, ?, ?, ?, ?)', 3, 'Primeiros Socorros Básico', 'Atendimento inicial em emergências', 'Interno - Téc. Enfermagem', 4, 12);
  await db.run('INSERT OR IGNORE INTO trainings (id, course_name, description, provider, duration_hours, frequency_months) VALUES (?, ?, ?, ?, ?, ?)', 4, 'Uso de EPIs Específicos', 'Treinamento sobre seleção e uso correto', 'Interno - Téc. Segurança', 2, 0);
  await db.run('INSERT OR IGNORE INTO trainings (id, course_name, description, provider, duration_hours, frequency_months) VALUES (?, ?, ?, ?, ?, ?)', 5, 'Operação de Empilhadeira', 'Treinamento para operar empilhadeiras', 'Centro Logístico Treinamentos', 20, 12);

  // Sample Training Records
  await db.run('INSERT OR IGNORE INTO training_records (employee_id, training_id, completion_date, expiry_date, score) VALUES (?, ?, ?, ?, ?)', 1, 1, '2023-10-15', '2025-10-15', 9.5);
  await db.run('INSERT OR IGNORE INTO training_records (employee_id, training_id, completion_date, expiry_date, score) VALUES (?, ?, ?, ?, ?)', 2, 2, '2024-02-20', '2025-02-20', 8.0);
  await db.run('INSERT OR IGNORE INTO training_records (employee_id, training_id, completion_date, expiry_date, score) VALUES (?, ?, ?, ?, ?)', 1, 3, '2024-05-01', '2025-05-01', 10.0);
  await db.run('INSERT OR IGNORE INTO training_records (employee_id, training_id, completion_date, score) VALUES (?, ?, ?, ?)', 3, 4, '2024-01-10', 8.8);
  await db.run('INSERT OR IGNORE INTO training_records (employee_id, training_id, completion_date, expiry_date, score) VALUES (?, ?, ?, ?, ?)', 2, 1, '2022-11-01', '2024-11-01', 9.0); // Vencendo
  await db.run('INSERT OR IGNORE INTO training_records (employee_id, training_id, completion_date, expiry_date, score) VALUES (?, ?, ?, ?, ?)', 3, 5, '2023-09-01', '2024-09-01', 9.2);

  // Sample JSAs
  await db.run('INSERT OR IGNORE INTO jsa (id, task, location_id, status, responsible_person_id, review_date, attachment_path) VALUES (?, ?, ?, ?, ?, ?, ?)', 1, 'Manutenção de Telhado', 6, 'Revisado', 2, '2024-05-10', '/uploads/jsa_telhado_v1.xlsx');
  await db.run('INSERT OR IGNORE INTO jsa (id, task, location_id, status, responsible_person_id, review_date) VALUES (?, ?, ?, ?, ?, ?)', 2, 'Operação da Prensa P-10', 1, 'Ativo', 3, '2024-06-20');
  await db.run('INSERT OR IGNORE INTO jsa (id, task, location_id, status, responsible_person_id, review_date) VALUES (?, ?, ?, ?, ?, ?)', 3, 'Manuseio de Ácido Sulfúrico', 4, 'Ativo', 3, '2024-07-01');
  await db.run('INSERT OR IGNORE INTO jsa (id, task, location_id, status, responsible_person_id) VALUES (?, ?, ?, ?, ?)', 4, 'Trabalho em Escritório (Digitação)', 3, 'Rascunho', 1);
  await db.run('INSERT OR IGNORE INTO jsa (id, task, location_id, status, responsible_person_id, review_date) VALUES (?, ?, ?, ?, ?, ?)', 5, 'Operação de Empilhadeira', 2, 'Ativo', 2, '2023-12-15');
  await db.run('INSERT OR IGNORE INTO jsa (id, task, location_id, status, responsible_person_id, review_date, attachment_path) VALUES (?, ?, ?, ?, ?, ?, ?)', 6, 'Manutenção Elétrica Painel X', 1, 'Revisado', 3, '2024-08-01', '/uploads/jsa_painel_eletrico.pdf');

  // Sample JSA Steps (for JSA ID 1)
  await db.run('INSERT OR IGNORE INTO jsa_steps (jsa_id, step_order, description, hazards, controls) VALUES (?, ?, ?, ?, ?)', 1, 1, 'Acessar telhado', 'Queda de mesmo nível, queda de altura', 'Uso de escada apropriada, linha de vida');
  await db.run('INSERT OR IGNORE INTO jsa_steps (jsa_id, step_order, description, hazards, controls) VALUES (?, ?, ?, ?, ?)', 1, 2, 'Remover telha danificada', 'Corte, queda de altura, queda de material', 'Uso de luvas, cinto de segurança, isolamento da área abaixo');
  await db.run('INSERT OR IGNORE INTO jsa_steps (jsa_id, step_order, description, hazards, controls) VALUES (?, ?, ?, ?, ?)', 1, 3, 'Instalar nova telha', 'Queda de altura, esforço físico', 'Cinto de segurança, postura correta');

  // Sample Documents
  await db.run('INSERT OR IGNORE INTO documents (id, title, category, version, status, file_path, description, jsa_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 1, 'Política de Segurança e Saúde', 'Política', '2.0', 'Ativo', '/docs/politica_sst_v2.pdf', 'Diretrizes gerais de SST', NULL);
  await db.run('INSERT OR IGNORE INTO documents (id, title, category, version, status, file_path, description, jsa_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 2, 'FDS - Álcool Etílico 70%', 'FDS', '1.1', 'Ativo', '/docs/fds_alcool_70.pdf', 'Ficha de Dados de Segurança', NULL);
  await db.run('INSERT OR IGNORE INTO documents (id, title, category, version, status, file_path, description, jsa_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 3, 'Procedimento Bloqueio e Etiquetagem', 'Procedimento', '3.0', 'Em Revisão', '/docs/proc_loto_v3.pdf', 'Procedimento LOTO', NULL);
  await db.run('INSERT OR IGNORE INTO documents (id, title, category, version, status, file_path, description, jsa_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 4, 'Manual Operacional Prensa P-10', 'Manual', '1.0', 'Ativo', '/docs/manual_p10.pdf', 'Manual da prensa hidráulica', 2); // Associado à JSA 2
  await db.run('INSERT OR IGNORE INTO documents (id, title, category, version, status, file_path, description, jsa_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 5, 'PPRA (Histórico)', 'PGR/PPRA', '2021', 'Obsoleto', '/docs/ppra_2021.pdf', 'Programa de Prevenção de Riscos Ambientais 2021', NULL);
  // Documento 6 removido pois agora o anexo é na própria JSA
  // await db.run('INSERT OR IGNORE INTO documents (id, title, category, version, status, file_path, description, jsa_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 6, 'JSA - Manutenção Telhado', 'JSA', '1.0', 'Ativo', '/docs/jsa_telhado_v1.xlsx', 'Análise de Risco para Manutenção de Telhado', 1);


  // Sample KPIs
  await db.run('INSERT OR IGNORE INTO kpis (name, value, category, unit, period) VALUES (?, ?, ?, ?, ?)', 'Riscos Identificados', 18, 'Segurança - Riscos', 'número', 'Total');
  await db.run('INSERT OR IGNORE INTO kpis (name, value, category, unit, period) VALUES (?, ?, ?, ?, ?)', 'Riscos Críticos', 3, 'Segurança - Riscos', 'número', 'Total');
  await db.run('INSERT OR IGNORE INTO kpis (name, value, category, unit, period) VALUES (?, ?, ?, ?, ?)', 'Incidentes Abertos', 4, 'Segurança - Incidentes', 'número', 'Atual');
  await db.run('INSERT OR IGNORE INTO kpis (name, value, category, unit, period) VALUES (?, ?, ?, ?, ?)', 'Incidentes com Afastamento', 1, 'Segurança - Incidentes', 'número', 'Mês Atual');
  await db.run('INSERT OR IGNORE INTO kpis (name, value, category, unit, period) VALUES (?, ?, ?, ?, ?)', 'Auditorias Pendentes', 2, 'Segurança - Auditorias', 'número', 'Atual');
  await db.run('INSERT OR IGNORE INTO kpis (name, value, category, unit, period) VALUES (?, ?, ?, ?, ?)', 'Treinamentos Vencidos', 5, 'Geral - Treinamentos', 'número', 'Atual');
  await db.run('INSERT OR IGNORE INTO kpis (name, value, category, unit, period) VALUES (?, ?, ?, ?, ?)', 'Treinamentos Vencendo Próx. Semana', 2, 'Geral - Treinamentos', 'número', 'Atual');

  // Sample Incidents
  await db.run('INSERT OR IGNORE INTO incidents (id, date, type, severity, location_id, status, description, reported_by_id, lost_days) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 1, '2024-08-17 10:30:00', 'Acidente sem Afastamento', 'Leve', 1, 'Fechado', 'Corte superficial no dedo ao manusear peça.', 3, 0);
  await db.run('INSERT OR IGNORE INTO incidents (id, date, type, severity, location_id, status, description, reported_by_id, lost_days) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 2, '2024-08-18 14:00:00', 'Acidente com Afastamento', 'Moderado', 1, 'Em Investigação', 'Entorse no tornozelo ao descer escada da máquina.', 3, 5);
  await db.run('INSERT OR IGNORE INTO incidents (id, date, type, severity, location_id, status, description, reported_by_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 3, '2024-08-19 09:15:00', 'Quase Acidente', 'N/A', 2, 'Fechado', 'Caixa caiu de prateleira próxima ao funcionário Carlos.', 1);
  await db.run('INSERT OR IGNORE INTO incidents (id, date, type, severity, location_id, status, description, reported_by_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 4, '2024-08-22 11:00:00', 'Incidente Ambiental', 'Insignificante', 5, 'Aberto', 'Pequeno vazamento de óleo contido na área de descarte.', 2);
  await db.run('INSERT OR IGNORE INTO incidents (id, date, type, severity, location_id, status, description, reported_by_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 5, '2024-08-23 16:45:00', 'Quase Acidente', 'N/A', 1, 'Aguardando Ação', 'Piso escorregadio devido a vazamento de óleo na máquina Y.', 6); // Alice reportou
  await db.run('INSERT OR IGNORE INTO incidents (id, date, type, severity, location_id, status, description, reported_by_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 6, '2024-08-24 08:00:00', 'Acidente sem Afastamento', 'Leve', 3, 'Aberto', 'Colisão com mobília, resultando em hematoma.', 4); // Diana reportou


   // Sample Action Plans
  await db.run('INSERT OR IGNORE INTO action_plans (id, description, origin, responsible_id, due_date, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)', 1, 'Instalar guarda-corpo na plataforma X', 'Inspeção Geral 08/24', 7, '2024-09-15', 'Alta', 'Aberta'); // Bruno Responsável
  await db.run('INSERT OR IGNORE INTO action_plans (id, description, origin, responsible_id, due_date, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)', 2, 'Revisar procedimento de bloqueio e etiquetagem', 'Auditoria ISO 45001 06/24', 3, '2024-08-30', 'Alta', 'Em Andamento'); // Técnico SST Responsável
  await db.run('INSERT OR IGNORE INTO action_plans (id, description, origin, responsible_id, due_date, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)', 3, 'Realizar treinamento de primeiros socorros', 'Obrigação Legal NR-7', 1, '2024-10-31', 'Média', 'Aberta'); // Admin Responsável
  await db.run('INSERT OR IGNORE INTO action_plans (id, description, origin, responsible_id, due_date, priority, status, completion_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 4, 'Sinalizar área de tráfego de empilhadeiras', 'Incidente ID 3 (Quase Acidente)', 3, '2024-07-31', 'Média', 'Concluída', '2024-07-28'); // Técnico SST Responsável
  await db.run('INSERT OR IGNORE INTO action_plans (id, description, origin, responsible_id, due_date, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)', 5, 'Adquirir novos protetores auriculares tipo concha', 'Monitoramento Ruído 07/24', 1, '2024-08-20', 'Baixa', 'Atrasada'); // Admin Responsável (Atrasado)
  await db.run('INSERT OR IGNORE INTO action_plans (id, description, origin, responsible_id, due_date, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)', 6, 'Limpar vazamento de óleo Máquina Y', 'Incidente ID 5', 7, '2024-08-26', 'Média', 'Aberta'); // Bruno Responsável

  // Sample Audits
  await db.run('INSERT OR IGNORE INTO audits (id, type, scope, audit_date, auditor, findings, non_conformities_count, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 1, 'Interna', 'Processo de Produção A', '2024-09-15', 'Equipe Interna', 'Planejamento inicial', 0, 'Planejada');
  await db.run('INSERT OR IGNORE INTO audits (id, type, scope, audit_date, auditor, findings, observations_count, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 2, 'Comportamental', 'Setor de Montagem', '2024-07-20', 'Consultoria XYZ', '10 Observações Comportamentais', 10, 'Concluída');
  await db.run('INSERT OR IGNORE INTO audits (id, type, scope, audit_date, auditor, findings, non_conformities_count, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 3, 'Externa (ISO 45001)', 'Sistema de Gestão SST', '2024-06-05', 'Certificadora ABC', '1 NC Maior, 2 NC Menores', 3, 'Concluída');

  // Sample Work Permits
  await db.run('INSERT OR IGNORE INTO work_permits (id, type, location_id, description, requester_id, approver_id, start_datetime, end_datetime, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 1, 'Trabalho a Quente', 7, 'Solda em estrutura metálica', 6, 1, '2024-08-26 09:00:00', '2024-08-26 17:00:00', 'Aprovada'); // Alice solicitou, Admin aprovou
  await db.run('INSERT OR IGNORE INTO work_permits (id, type, location_id, description, requester_id, start_datetime, end_datetime, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 2, 'Espaço Confinado', 1, 'Inspeção interna Tanque T-101', 7, '2024-08-27 08:00:00', '2024-08-27 12:00:00', 'Solicitada'); // Bruno solicitou

  // Sample PPE Types
  await db.run('INSERT OR IGNORE INTO ppe_types (id, name, specification, lifespan_months) VALUES (?, ?, ?, ?)', 1, 'Capacete de Segurança Classe B', 'Com jugular', 24);
  await db.run('INSERT OR IGNORE INTO ppe_types (id, name, specification, lifespan_months) VALUES (?, ?, ?, ?)', 2, 'Luva Nitrílica Descartável', 'Tam M/G', 0);
  await db.run('INSERT OR IGNORE INTO ppe_types (id, name, specification, lifespan_months) VALUES (?, ?, ?, ?)', 3, 'Óculos de Segurança Ampla Visão', 'Anti-embaçante', 12);
  await db.run('INSERT OR IGNORE INTO ppe_types (id, name, specification, lifespan_months) VALUES (?, ?, ?, ?)', 4, 'Protetor Auricular Plug Silicone', 'Com cordão', 6);
  await db.run('INSERT OR IGNORE INTO ppe_types (id, name, specification, lifespan_months) VALUES (?, ?, ?, ?)', 5, 'Botina de Segurança Couro', 'Bico de aço, CA 12345', 12);

  // Sample PPE Records
  await db.run('INSERT OR IGNORE INTO ppe_records (id, employee_id, ppe_type_id, delivery_date, ca_number, due_date) VALUES (?, ?, ?, ?, ?, ?)', 1, 1, 1, '2024-01-15', '98765', '2026-01-15'); // Alice, Capacete
  await db.run('INSERT OR IGNORE INTO ppe_records (id, employee_id, ppe_type_id, delivery_date, quantity, ca_number) VALUES (?, ?, ?, ?, ?, ?)', 2, 2, 2, '2024-08-01', 100, 'N/A'); // Bruno, Luva
  await db.run('INSERT OR IGNORE INTO ppe_records (id, employee_id, ppe_type_id, delivery_date, ca_number, due_date) VALUES (?, ?, ?, ?, ?, ?)', 3, 1, 3, '2024-03-20', '54321', '2025-03-20'); // Alice, Óculos
  await db.run('INSERT OR IGNORE INTO ppe_records (id, employee_id, ppe_type_id, delivery_date, ca_number, due_date) VALUES (?, ?, ?, ?, ?, ?)', 4, 3, 5, '2023-07-10', '12345', '2024-07-10'); // Carlos, Botina (Vencido)
  await db.run('INSERT OR IGNORE INTO ppe_records (id, employee_id, ppe_type_id, delivery_date, ca_number, due_date) VALUES (?, ?, ?, ?, ?, ?)', 5, 2, 4, '2024-05-01', '67890', '2024-11-01'); // Bruno, Protetor Auricular

  // Sample ASOs
  await db.run('INSERT OR IGNORE INTO asos (id, employee_id, type, exam_date, result, next_exam_due_date) VALUES (?, ?, ?, ?, ?, ?)', 1, 1, 'Periódico', '2024-05-10', 'Apto', '2025-05-10');
  await db.run('INSERT OR IGNORE INTO asos (id, employee_id, type, exam_date, result, next_exam_due_date) VALUES (?, ?, ?, ?, ?, ?)', 2, 2, 'Admissional', '2024-01-15', 'Apto', '2025-01-15');
  await db.run('INSERT OR IGNORE INTO asos (id, employee_id, type, exam_date, result, restrictions, next_exam_due_date) VALUES (?, ?, ?, ?, ?, ?, ?)', 3, 3, 'Mudança de Função', '2024-07-01', 'Apto com Restrições', 'Evitar levantar peso > 15kg', '2025-07-01');

  // Sample Chemical Inventory
  await db.run('INSERT OR IGNORE INTO chemical_inventory (id, product_name, cas_number, location_id, quantity, unit, hazard_class) VALUES (?, ?, ?, ?, ?, ?, ?)', 1, 'Ácido Sulfúrico 98%', '7664-93-9', 4, 10, 'L', 'Corrosivo');
  await db.run('INSERT OR IGNORE INTO chemical_inventory (id, product_name, cas_number, location_id, quantity, unit, hazard_class) VALUES (?, ?, ?, ?, ?, ?, ?)', 2, 'Hidróxido de Sódio', '1310-73-2', 2, 25, 'kg', 'Corrosivo');
  await db.run('INSERT OR IGNORE INTO chemical_inventory (id, product_name, cas_number, location_id, quantity, unit, hazard_class) VALUES (?, ?, ?, ?, ?, ?, ?)', 3, 'Etanol Absoluto', '64-17-5', 1, 200, 'L', 'Inflamável');

  console.log('Dados de exemplo SQLite verificados/inseridos com sucesso.');


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

// --- Funções CRUD ---

// --- KPIs ---
export async function insertKpi(name: string, value: number, category?: string, unit?: string, target?: number, period?: string, data_date?: string) {
  const db = await getDbConnection();
  const result = await db.run(
    'INSERT INTO kpis (name, value, category, unit, target, period, data_date, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(name) DO UPDATE SET value=excluded.value, category=excluded.category, unit=excluded.unit, target=excluded.target, period=excluded.period, data_date=excluded.data_date, updated_at=CURRENT_TIMESTAMP',
    name, value, category ?? null, unit ?? null, target ?? null, period ?? null, data_date ?? null
  );
  return result.lastID;
}

export async function getAllKpis() {
  const db = await getDbConnection();
  const kpis = await db.all('SELECT * FROM kpis ORDER BY category, name');
  return kpis;
}

// --- Incidents ---
export async function insertIncident(description: string, date: string, type: string, severity?: string, locationId?: number, reportedById?: number) {
    const db = await getDbConnection();
    const result = await db.run(
        'INSERT INTO incidents (description, date, type, severity, location_id, reported_by_id) VALUES (?, ?, ?, ?, ?, ?)',
        description, date, type, severity ?? null, locationId ?? null, reportedById ?? null
    );
    return result.lastID;
}

export async function getAllIncidents() {
    const db = await getDbConnection();
    const incidents = await db.all(`
        SELECT i.*, l.name as location_name, u.name as reporter_name
        FROM incidents i
        LEFT JOIN locations l ON i.location_id = l.id
        LEFT JOIN users u ON i.reported_by_id = u.id
        ORDER BY i.date DESC
    `);
    return incidents;
}

// --- JSA (Job Safety Analysis) ---
interface JsaInput {
    task: string;
    locationId?: number | null; // Allow null from form
    department?: string | null;
    responsiblePersonId?: number | null; // Allow null from form
    teamMembers?: string | null;
    requiredPpe?: string | null;
    status?: string | null;
    reviewDate?: string | null; // YYYY-MM-DD or null
    attachmentPath?: string | null; // Add attachment path
}

interface JsaStepInput {
    step_order: number;
    description: string;
    hazards: string;
    controls: string;
}

export async function insertJsa(jsaData: JsaInput, stepsData: JsaStepInput[]): Promise<number | undefined> {
    const db = await getDbConnection();
    let jsaId: number | undefined;

    try {
        // Iniciar transação
        await db.run('BEGIN TRANSACTION');

        // Inserir dados principais da JSA
        // Certifique-se de que valores undefined se tornem NULL no banco de dados
        const resultJsa = await db.run(
            'INSERT INTO jsa (task, location_id, department, responsible_person_id, team_members, required_ppe, status, review_date, attachment_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            jsaData.task,
            jsaData.locationId ?? null, // Use ?? null para converter undefined para null
            jsaData.department ?? null,
            jsaData.responsiblePersonId ?? null,
            jsaData.teamMembers ?? null,
            jsaData.requiredPpe ?? null,
            jsaData.status ?? 'Rascunho',
            jsaData.reviewDate ?? null,
            jsaData.attachmentPath ?? null // Add attachment path
        );
        jsaId = resultJsa.lastID;

        if (!jsaId) {
            throw new Error("Falha ao obter ID da JSA inserida.");
        }

        // Inserir os passos da JSA (se houver)
        if (stepsData && stepsData.length > 0) {
            const stmtStep = await db.prepare(
                'INSERT INTO jsa_steps (jsa_id, step_order, description, hazards, controls) VALUES (?, ?, ?, ?, ?)'
            );
            for (const step of stepsData) {
                await stmtStep.run(jsaId, step.step_order, step.description, step.hazards, step.controls);
            }
            await stmtStep.finalize();
        }

        // Commit da transação
        await db.run('COMMIT');

        return jsaId;

    } catch (error) {
        console.error("Erro ao inserir JSA (rollback):", error);
        // Rollback em caso de erro
        await db.run('ROLLBACK');
        throw error; // Re-throw error para tratamento superior
    }
}


export async function getAllJsas() {
  const db = await getDbConnection();
  const jsas = await db.all(`
    SELECT j.*, l.name as location_name, u.name as responsible_person_name
    FROM jsa j
    LEFT JOIN locations l ON j.location_id = l.id
    LEFT JOIN users u ON j.responsible_person_id = u.id
    ORDER BY j.id DESC -- Order by most recent first
  `);
  return jsas;
}

export async function getJsaSteps(jsaId: number) {
    const db = await getDbConnection();
    const steps = await db.all(
        'SELECT * FROM jsa_steps WHERE jsa_id = ? ORDER BY step_order',
        jsaId
    );
    return steps;
}


// --- Employees ---
export async function insertEmployee(name: string, role?: string | null, department?: string | null, hireDate?: string | null): Promise<number | undefined> {
  const db = await getDbConnection();
  const result = await db.run(
    'INSERT INTO employees (name, role, department, hire_date) VALUES (?, ?, ?, ?)',
    name,
    role || null,
    department || null,
    hireDate || null
  );
  return result.lastID;
}


export async function getAllEmployees() {
  const db = await getDbConnection();
  const employees = await db.all('SELECT id, name FROM employees ORDER BY name'); // Only return id and name for selections
  return employees;
}

// --- Locations ---
export async function insertLocation(name: string, description?: string | null, type?: string | null): Promise<number | undefined> {
  const db = await getDbConnection();
  const result = await db.run(
    'INSERT INTO locations (name, description, type) VALUES (?, ?, ?)',
    name,
    description || null,
    type || null
  );
  return result.lastID;
}

export async function getAllLocations() {
  const db = await getDbConnection();
  const locations = await db.all('SELECT id, name FROM locations ORDER BY name'); // Only return id and name for selections
  return locations;
}

// --- Equipment ---
export async function insertEquipment(name: string, type?: string | null, locationId?: number | null, serialNumber?: string | null, maintenanceSchedule?: string | null, lastMaintenanceDate?: string | null): Promise<number | undefined> {
  const db = await getDbConnection();
  const result = await db.run(
    'INSERT INTO equipment (name, type, location_id, serial_number, maintenance_schedule, last_maintenance_date) VALUES (?, ?, ?, ?, ?, ?)',
    name,
    type || null,
    locationId || null,
    serialNumber || null,
    maintenanceSchedule || null,
    lastMaintenanceDate || null
  );
  return result.lastID;
}

export async function getAllEquipment() {
    const db = await getDbConnection();
    const equipment = await db.all(`
        SELECT eq.*, l.name as location_name
        FROM equipment eq
        LEFT JOIN locations l ON eq.location_id = l.id
        ORDER BY eq.name
    `);
    return equipment;
}


// --- Trainings (Courses) ---
export async function insertTraining(courseName: string, description?: string | null, provider?: string | null, durationHours?: number | null, frequencyMonths?: number | null): Promise<number | undefined> {
  const db = await getDbConnection();
  const result = await db.run(
    'INSERT INTO trainings (course_name, description, provider, duration_hours, frequency_months) VALUES (?, ?, ?, ?, ?)',
    courseName,
    description || null,
    provider || null,
    durationHours || null,
    frequencyMonths === 0 ? 0 : (frequencyMonths || null) // Treat 0 as 0, otherwise null if empty/undefined
  );
  return result.lastID;
}

export async function getAllTrainings() {
  const db = await getDbConnection();
  const trainings = await db.all('SELECT id, course_name FROM trainings ORDER BY course_name'); // Only id and name for selection
  return trainings;
}

// --- Training Records ---
export async function insertTrainingRecord(employeeId: number, trainingId: number, completionDate: string, expiryDate?: string | null, score?: number | null, certificatePath?: string | null): Promise<number | undefined> {
  const db = await getDbConnection();
  const result = await db.run(
    'INSERT INTO training_records (employee_id, training_id, completion_date, expiry_date, score, certificate_path) VALUES (?, ?, ?, ?, ?, ?)',
    employeeId,
    trainingId,
    completionDate, // Assuming 'YYYY-MM-DD'
    expiryDate || null, // Assuming 'YYYY-MM-DD' or null
    score ?? null, // Use ?? to handle 0 score correctly
    certificatePath || null
  );
  return result.lastID;
}


export async function getAllTrainingRecords() {
  const db = await getDbConnection();
  const records = await db.all(`
    SELECT tr.*, e.name as employee_name, t.course_name as training_name
    FROM training_records tr
    JOIN employees e ON tr.employee_id = e.id
    JOIN trainings t ON tr.training_id = t.id
    ORDER BY tr.completion_date DESC
  `);
  return records;
}


// --- Documents ---
export async function insertDocument(title: string, description?: string | null, category?: string | null, filePath?: string | null, version?: string | null, reviewDate?: string | null, status?: string | null): Promise<number | undefined> {
  const db = await getDbConnection();
  const result = await db.run(
    'INSERT INTO documents (title, description, category, file_path, version, review_date, status, upload_date) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_DATE)',
    title,
    description || null,
    category || null,
    filePath || null,
    version || null,
    reviewDate || null,
    status || 'Ativo'
  );
  return result.lastID;
}

export async function getAllDocuments() {
  const db = await getDbConnection();
  const documents = await db.all('SELECT * FROM documents ORDER BY upload_date DESC, title');
  return documents;
}


// --- Users ---
// Note: Password hashing should happen *before* calling insertUser
export async function insertUser(name: string, email: string, passwordHash: string, role?: string | null, isActive?: boolean | null): Promise<number | undefined> {
  const db = await getDbConnection();
  const result = await db.run(
    'INSERT INTO users (name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)',
    name,
    email,
    passwordHash,
    role || 'user',
    isActive === null || isActive === undefined ? true : isActive
  );
  return result.lastID;
}

export async function getUserByEmail(email: string) {
  const db = await getDbConnection();
  const user = await db.get('SELECT * FROM users WHERE email = ?', email);
  return user;
}

export async function getAllUsers() {
  const db = await getDbConnection();
  // Exclude password hash from general listing
  const users = await db.all('SELECT id, name, email, role, is_active, created_at FROM users ORDER BY name');
  return users;
}


// --- Activity Logs ---
export async function insertActivityLog(action: string, details?: string | null, userId?: number | null): Promise<number | undefined> {
  const db = await getDbConnection();
  const result = await db.run(
    'INSERT INTO activity_logs (action, details, user_id) VALUES (?, ?, ?)',
    action,
    details || null,
    userId || null
  );
  return result.lastID;
}

export async function getAllActivityLogs(limit: number = 50) {
    const db = await getDbConnection();
    const logs = await db.all(`
        SELECT al.*, u.name as user_name
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        ORDER BY al.timestamp DESC
        LIMIT ?
    `, limit);
    return logs;
}


// --- Action Plans ---
// Add this new function to fetch dashboard items
export async function getDashboardActionItems(limit: number = 5): Promise<any[]> {
  const db = await getDbConnection();
  const items = await db.all(`
    SELECT ap.*, u.name as responsible_name
    FROM action_plans ap
    LEFT JOIN users u ON ap.responsible_id = u.id
    WHERE ap.status = 'Aberta' OR (ap.status = 'Em Andamento') OR (ap.status = 'Atrasada') -- Include 'Atrasada'
    ORDER BY
      CASE ap.priority
        WHEN 'Alta' THEN 1
        WHEN 'Média' THEN 2
        WHEN 'Baixa' THEN 3
        ELSE 4
      END,
      ap.due_date ASC -- Order by due date after priority
    LIMIT ?
  `, limit);
  return items;
}

// ... Implement CRUD for other tables similarly ...
// (audits, audit_items, work_permits, ppe_types, ppe_records, action_plans, legal_actions, asos, occupational_diseases, etc.)

// export async function insertActionPlan(description: string, origin: string, responsibleId: number, dueDate: string, ...) { ... }
// export async function getAllActionPlans() { ... }

// ... (rest of the existing CRUD functions)


// --- CRUD for Locations ---
// export async function insertLocation(name: string, description?: string, type?: string) { ... }
// export async function getAllLocations() { ... }

// --- CRUD for Equipment ---
// export async function insertEquipment(name: string, type?: string, locationId?: number, serialNumber?: string, ...) { ... }
// export async function getAllEquipment() { ... }

// --- CRUD for PPE Types ---
// export async function insertPpeType(name: string, specification?: string, lifespanMonths?: number) { ... }
// export async function getAllPpeTypes() { ... }

// --- CRUD for PPE Records ---
// export async function insertPpeRecord(employeeId: number, ppeTypeId: number, deliveryDate: string, ...) { ... }
// export async function getAllPpeRecords() { ... }


// --- CRUD for ASOs ---
// export async function insertAso(employeeId: number, type: string, examDate: string, result: string, ...) { ... }
// export async function getAllAsos() { ... }


// --- CRUD for Chemical Inventory ---
// export async function insertChemical(productName: string, locationId: number, quantity: number, unit: string, ...) { ... }
// export async function getAllChemicals() { ... }
