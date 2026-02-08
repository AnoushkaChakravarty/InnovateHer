-- =============================================
-- InnovateHer 2026: The Equity Gap
-- Snowflake Salary Seed Data
-- Sources: BLS, Levels.fyi, Glassdoor, PayScale, Salary.com (2025)
-- Run this in Snowflake Worksheets (snowflake.com)
-- =============================================

CREATE DATABASE IF NOT EXISTS HACKATHON_DB;
USE DATABASE HACKATHON_DB;
USE SCHEMA PUBLIC;

CREATE OR REPLACE TABLE SALARIES (
    JOB_TITLE STRING,
    ANNUAL_SALARY INTEGER,
    EXPERIENCE_LEVEL STRING
);

-- =============================================
-- ~150 rows across 10 roles x 3 levels
-- Ranges based on 2025 US base salary data
-- =============================================

INSERT INTO SALARIES (JOB_TITLE, ANNUAL_SALARY, EXPERIENCE_LEVEL) VALUES

-- SOFTWARE ENGINEER (BLS median $130k; Entry $78-100k, Mid $110-145k, Senior $145-200k)
('Software Engineer', 78000, 'Entry'),
('Software Engineer', 82000, 'Entry'),
('Software Engineer', 88000, 'Entry'),
('Software Engineer', 92000, 'Entry'),
('Software Engineer', 97000, 'Entry'),
('Software Engineer', 112000, 'Mid'),
('Software Engineer', 122000, 'Mid'),
('Software Engineer', 130000, 'Mid'),
('Software Engineer', 138000, 'Mid'),
('Software Engineer', 144000, 'Mid'),
('Software Engineer', 150000, 'Senior'),
('Software Engineer', 162000, 'Senior'),
('Software Engineer', 175000, 'Senior'),
('Software Engineer', 188000, 'Senior'),
('Software Engineer', 198000, 'Senior'),

-- DATA ANALYST (BLS median ~$75k; Entry $52-68k, Mid $70-92k, Senior $95-125k)
('Data Analyst', 53000, 'Entry'),
('Data Analyst', 58000, 'Entry'),
('Data Analyst', 62000, 'Entry'),
('Data Analyst', 66000, 'Entry'),
('Data Analyst', 68000, 'Entry'),
('Data Analyst', 72000, 'Mid'),
('Data Analyst', 78000, 'Mid'),
('Data Analyst', 83000, 'Mid'),
('Data Analyst', 88000, 'Mid'),
('Data Analyst', 91000, 'Mid'),
('Data Analyst', 96000, 'Senior'),
('Data Analyst', 103000, 'Senior'),
('Data Analyst', 110000, 'Senior'),
('Data Analyst', 118000, 'Senior'),
('Data Analyst', 124000, 'Senior'),

-- DATA SCIENTIST (Entry $85-110k, Mid $115-150k, Senior $155-200k)
('Data Scientist', 87000, 'Entry'),
('Data Scientist', 92000, 'Entry'),
('Data Scientist', 98000, 'Entry'),
('Data Scientist', 105000, 'Entry'),
('Data Scientist', 110000, 'Entry'),
('Data Scientist', 118000, 'Mid'),
('Data Scientist', 128000, 'Mid'),
('Data Scientist', 135000, 'Mid'),
('Data Scientist', 142000, 'Mid'),
('Data Scientist', 149000, 'Mid'),
('Data Scientist', 158000, 'Senior'),
('Data Scientist', 168000, 'Senior'),
('Data Scientist', 180000, 'Senior'),
('Data Scientist', 192000, 'Senior'),
('Data Scientist', 200000, 'Senior'),

-- PRODUCT MANAGER (Indeed avg $128k; Entry $80-105k, Mid $110-145k, Senior $145-195k)
('Product Manager', 82000, 'Entry'),
('Product Manager', 88000, 'Entry'),
('Product Manager', 93000, 'Entry'),
('Product Manager', 98000, 'Entry'),
('Product Manager', 104000, 'Entry'),
('Product Manager', 112000, 'Mid'),
('Product Manager', 122000, 'Mid'),
('Product Manager', 130000, 'Mid'),
('Product Manager', 138000, 'Mid'),
('Product Manager', 144000, 'Mid'),
('Product Manager', 148000, 'Senior'),
('Product Manager', 158000, 'Senior'),
('Product Manager', 170000, 'Senior'),
('Product Manager', 182000, 'Senior'),
('Product Manager', 193000, 'Senior'),

-- UX DESIGNER (Entry $60-78k, Mid $80-108k, Senior $110-145k)
('UX Designer', 61000, 'Entry'),
('UX Designer', 66000, 'Entry'),
('UX Designer', 70000, 'Entry'),
('UX Designer', 74000, 'Entry'),
('UX Designer', 78000, 'Entry'),
('UX Designer', 82000, 'Mid'),
('UX Designer', 88000, 'Mid'),
('UX Designer', 94000, 'Mid'),
('UX Designer', 100000, 'Mid'),
('UX Designer', 106000, 'Mid'),
('UX Designer', 112000, 'Senior'),
('UX Designer', 120000, 'Senior'),
('UX Designer', 128000, 'Senior'),
('UX Designer', 136000, 'Senior'),
('UX Designer', 142000, 'Senior'),

-- MARKETING MANAGER (Entry $50-65k, Mid $68-92k, Senior $95-130k)
('Marketing Manager', 52000, 'Entry'),
('Marketing Manager', 56000, 'Entry'),
('Marketing Manager', 60000, 'Entry'),
('Marketing Manager', 63000, 'Entry'),
('Marketing Manager', 65000, 'Entry'),
('Marketing Manager', 70000, 'Mid'),
('Marketing Manager', 76000, 'Mid'),
('Marketing Manager', 82000, 'Mid'),
('Marketing Manager', 87000, 'Mid'),
('Marketing Manager', 91000, 'Mid'),
('Marketing Manager', 96000, 'Senior'),
('Marketing Manager', 104000, 'Senior'),
('Marketing Manager', 112000, 'Senior'),
('Marketing Manager', 120000, 'Senior'),
('Marketing Manager', 128000, 'Senior'),

-- FINANCIAL ANALYST (Entry $55-70k, Mid $72-95k, Senior $98-135k)
('Financial Analyst', 56000, 'Entry'),
('Financial Analyst', 60000, 'Entry'),
('Financial Analyst', 64000, 'Entry'),
('Financial Analyst', 67000, 'Entry'),
('Financial Analyst', 70000, 'Entry'),
('Financial Analyst', 74000, 'Mid'),
('Financial Analyst', 80000, 'Mid'),
('Financial Analyst', 86000, 'Mid'),
('Financial Analyst', 90000, 'Mid'),
('Financial Analyst', 94000, 'Mid'),
('Financial Analyst', 100000, 'Senior'),
('Financial Analyst', 108000, 'Senior'),
('Financial Analyst', 116000, 'Senior'),
('Financial Analyst', 125000, 'Senior'),
('Financial Analyst', 133000, 'Senior'),

-- PROJECT MANAGER (Entry $60-78k, Mid $80-108k, Senior $110-142k)
('Project Manager', 62000, 'Entry'),
('Project Manager', 66000, 'Entry'),
('Project Manager', 70000, 'Entry'),
('Project Manager', 74000, 'Entry'),
('Project Manager', 78000, 'Entry'),
('Project Manager', 82000, 'Mid'),
('Project Manager', 88000, 'Mid'),
('Project Manager', 95000, 'Mid'),
('Project Manager', 102000, 'Mid'),
('Project Manager', 107000, 'Mid'),
('Project Manager', 112000, 'Senior'),
('Project Manager', 120000, 'Senior'),
('Project Manager', 128000, 'Senior'),
('Project Manager', 135000, 'Senior'),
('Project Manager', 141000, 'Senior'),

-- DEVOPS ENGINEER (Entry $80-102k, Mid $108-142k, Senior $148-195k)
('DevOps Engineer', 82000, 'Entry'),
('DevOps Engineer', 87000, 'Entry'),
('DevOps Engineer', 92000, 'Entry'),
('DevOps Engineer', 97000, 'Entry'),
('DevOps Engineer', 101000, 'Entry'),
('DevOps Engineer', 110000, 'Mid'),
('DevOps Engineer', 118000, 'Mid'),
('DevOps Engineer', 126000, 'Mid'),
('DevOps Engineer', 134000, 'Mid'),
('DevOps Engineer', 141000, 'Mid'),
('DevOps Engineer', 150000, 'Senior'),
('DevOps Engineer', 160000, 'Senior'),
('DevOps Engineer', 172000, 'Senior'),
('DevOps Engineer', 183000, 'Senior'),
('DevOps Engineer', 194000, 'Senior'),

-- MACHINE LEARNING ENGINEER (Entry $95-120k, Mid $125-165k, Senior $170-225k)
('Machine Learning Engineer', 96000, 'Entry'),
('Machine Learning Engineer', 102000, 'Entry'),
('Machine Learning Engineer', 108000, 'Entry'),
('Machine Learning Engineer', 114000, 'Entry'),
('Machine Learning Engineer', 119000, 'Entry'),
('Machine Learning Engineer', 127000, 'Mid'),
('Machine Learning Engineer', 136000, 'Mid'),
('Machine Learning Engineer', 145000, 'Mid'),
('Machine Learning Engineer', 155000, 'Mid'),
('Machine Learning Engineer', 163000, 'Mid'),
('Machine Learning Engineer', 172000, 'Senior'),
('Machine Learning Engineer', 184000, 'Senior'),
('Machine Learning Engineer', 198000, 'Senior'),
('Machine Learning Engineer', 212000, 'Senior'),
('Machine Learning Engineer', 224000, 'Senior');

-- =============================================
-- VERIFY: Check averages match real market data
-- =============================================
SELECT
    JOB_TITLE,
    COUNT(*) as sample_size,
    ROUND(AVG(ANNUAL_SALARY)) as avg_salary,
    MIN(ANNUAL_SALARY) as min_salary,
    MAX(ANNUAL_SALARY) as max_salary
FROM SALARIES
GROUP BY JOB_TITLE
ORDER BY avg_salary DESC;
