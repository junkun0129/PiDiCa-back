CREATE TABLE Users (
    user_cd CHAR(36) PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    user_img VARCHAR(255),
    user_is_manage ENUM('0', '1') NOT NULL DEFAULT '0',
    user_email VARCHAR(255) NOT NULL UNIQUE,
    user_password VARCHAR(255) NOT NULL
);

CREATE TABLE Projects (
    project_cd CHAR(36) PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    created_by CHAR(36) NOT NULL,
    created_at DATE NOT NULL,
    updated_at DATE NOT NULL
);

CREATE TABLE MemberCards (
    membercard_cd CHAR(36) PRIMARY KEY,
    project_cd CHAR(36) NOT NULL,
    user_cd CHAR(36) NOT NULL,
    status ENUM('0', '1') NOT NULL,
    created_at DATE,
    updated_at DATE,
    FOREIGN KEY (project_cd) REFERENCES Projects(project_cd) ON DELETE CASCADE,
    FOREIGN KEY (user_cd) REFERENCES Users(user_cd) ON DELETE CASCADE
);

CREATE TABLE Reports (
    report_cd CHAR(36) PRIMARY KEY,
    user_cd CHAR(36) NOT NULL,
    report_created_at DATE,
    report_updated_at DATE,
    report_date DATE NOT NULL,
    report_status ENUM('0', '1') NOT NULL,
    report_workhour VARCHAR(3) NOT NULL,
    FOREIGN KEY (user_cd) REFERENCES Users(user_cd) ON DELETE CASCADE
);

CREATE TABLE Tasks (
    task_cd CHAR(36) PRIMARY KEY,
    project_cd CHAR(36),
    user_cd CHAR(36),
    task_name VARCHAR(255) NOT NULL,
    task_detail TEXT,
    task_plan TEXT,
    task_do TEXT,
    task_check TEXT,
    task_action TEXT,
    created_at DATE NOT NULL,
    updated_at DATE NOT NULL,
    FOREIGN KEY (project_cd) REFERENCES Projects(project_cd) ON DELETE SET NULL,
    FOREIGN KEY (user_cd) REFERENCES Users(user_cd) ON DELETE SET NULL
);

CREATE TABLE ReportItems (
    reportitem_cd CHAR(36) PRIMARY KEY,
    report_cd CHAR(36) NOT NULL,
    task_cd CHAR(36) NOT NULL,
    reportitem_starttime INT,
    reportitem_endtime INT,
    FOREIGN KEY (report_cd) REFERENCES Reports(report_cd) ON DELETE CASCADE,
    FOREIGN KEY (task_cd) REFERENCES Tasks(task_cd) ON DELETE CASCADE
);
