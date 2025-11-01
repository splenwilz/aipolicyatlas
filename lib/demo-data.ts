/**
 * Demo data for AI Policy Atlas
 * 
 * This file contains sample policy data for development and demonstration.
 * In production, this data would come from the backend API.
 * 
 * Reference: plan/blueprint.md - Example Data Schema section
 */

import type { Policy } from '@/types/policy';

/**
 * Array of demo policies with realistic content
 * 
 * These policies represent various types of AI governance documents:
 * - AI usage policies
 * - Code of conduct with AI sections
 * - Ethics guidelines
 * - Model governance rules
 */
export const demoPolicies: Policy[] = [
  {
    id: '1',
    repo_id: 'repo-1',
    filename: 'AI_USAGE_POLICY.md',
    content: `# AI Usage Policy

## Overview

This project welcomes the use of AI tools to enhance productivity, but requires responsible and transparent AI usage.

## Allowed Uses

- **Code Generation**: Using AI to generate boilerplate code, tests, and documentation
- **Code Review**: AI-assisted code review for identifying potential issues
- **Documentation**: AI help in writing and improving documentation
- **Learning**: Using AI as a learning tool to understand new concepts

## Requirements

1. **Disclosure**: Contributors must disclose AI usage in PR descriptions
2. **Review**: All AI-generated code must be reviewed by human maintainers
3. **Verification**: AI suggestions must be verified for correctness and security
4. **Attribution**: Use of copyrighted training data should be acknowledged when applicable

## Prohibited Uses

- Submitting AI-generated content without review
- Using AI to circumvent security measures
- Automated spam or abuse through AI tools

## Enforcement

Violations may result in:
- Warning for first offense
- Temporary ban for repeated violations
- Permanent ban for severe violations

Last updated: 2024-01-15`,
    summary: 'A comprehensive policy governing AI tool usage in software development. Covers allowed uses like code generation and documentation, requires disclosure and review of AI-generated content, and prohibits abuse. Includes enforcement mechanisms.',
    tags: ['ai-usage', 'governance', 'ethics', 'transparency'],
    ai_score: 87,
    upvotes_count: 142,
    downvotes_count: 8,
    language: 'en',
    created_at: '2024-01-15T10:00:00Z',
    repo: {
      id: 'repo-1',
      name: 'opensource-project',
      full_name: 'acme/opensource-project',
      stars: 1250,
      forks: 89,
      language: 'TypeScript',
      url: 'https://github.com/acme/opensource-project',
      updated_at: '2024-01-20T14:30:00Z',
    },
  },
  {
    id: '2',
    repo_id: 'repo-2',
    filename: 'CODE_OF_CONDUCT.md',
    content: `# Code of Conduct

## Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, including in our use of AI tools.

## AI Ethics Commitment

### Responsible AI Development
- We commit to developing AI features that are fair, transparent, and accountable
- All AI models used must be auditable and explainable
- We will not use AI to discriminate against individuals or groups

### Data Privacy
- User data used for AI training will be anonymized
- Consent will be obtained before using user data in AI models
- Users can opt-out of AI features at any time

### Transparency
- AI decisions affecting users will be explained
- AI-generated content will be clearly marked
- Algorithmic bias will be actively monitored and corrected

## Reporting Issues

If you encounter issues with AI behavior or bias, please report it to our ethics committee.

## Enforcement

Maintainers are responsible for enforcing this code of conduct.`,
    summary: 'A code of conduct with strong emphasis on AI ethics. Includes commitments to responsible AI development, data privacy, transparency, and mechanisms for reporting AI-related issues. Demonstrates thoughtful integration of AI governance into community standards.',
    tags: ['code-of-conduct', 'ethics', 'ai-governance', 'transparency', 'bias'],
    ai_score: 92,
    upvotes_count: 203,
    downvotes_count: 5,
    language: 'en',
    created_at: '2024-01-10T09:15:00Z',
    repo: {
      id: 'repo-2',
      name: 'ethical-ai',
      full_name: 'foundation/ethical-ai',
      stars: 3420,
      forks: 456,
      language: 'Python',
      url: 'https://github.com/foundation/ethical-ai',
      updated_at: '2024-01-18T11:20:00Z',
    },
  },
  {
    id: '3',
    repo_id: 'repo-3',
    filename: 'AI_RULES.md',
    content: `# AI Development Rules

## Model Training

### Data Requirements
- Only use datasets with proper licensing
- Ensure data diversity and representativeness
- Document data sources and preprocessing steps

### Evaluation
- Models must be evaluated on diverse test sets
- Bias metrics must be reported
- Performance must be documented for different user groups

## Deployment

### Pre-deployment Checklist
- [ ] Model bias assessment completed
- [ ] Privacy impact analysis done
- [ ] Security review passed
- [ ] Documentation updated

### Monitoring
- Continuous monitoring of model performance
- Regular bias audits
- User feedback collection

## Version Control

All model versions must be:
- Versioned with semantic versioning
- Stored with reproducible training code
- Documented with performance metrics

## Incident Response

In case of model failure or bias issues:
1. Immediate rollback to previous version
2. Incident report within 24 hours
3. Root cause analysis
4. Corrective action plan`,
    summary: 'Comprehensive rules for AI model development and deployment. Covers data requirements, evaluation standards, deployment checklists, monitoring protocols, version control, and incident response procedures. Well-structured with actionable checklists.',
    tags: ['model-governance', 'deployment', 'bias', 'monitoring', 'version-control'],
    ai_score: 89,
    upvotes_count: 167,
    downvotes_count: 12,
    language: 'en',
    created_at: '2024-01-12T16:45:00Z',
    repo: {
      id: 'repo-3',
      name: 'ml-platform',
      full_name: 'techcorp/ml-platform',
      stars: 890,
      forks: 123,
      language: 'Python',
      url: 'https://github.com/techcorp/ml-platform',
      updated_at: '2024-01-19T09:10:00Z',
    },
  },
  {
    id: '4',
    repo_id: 'repo-4',
    filename: 'CONTRIBUTING.md',
    content: `# Contributing Guidelines

## AI-Assisted Contributions

We encourage the use of AI coding assistants, but with guidelines.

### Acceptable AI Use
- **Pair Programming**: Using AI as a pair programming partner
- **Exploration**: Using AI to explore solutions and understand options
- **Documentation**: AI-assisted documentation writing

### Requirements
1. **Review**: All contributions must be reviewed by humans
2. **Understanding**: Contributors must understand what they're submitting
3. **Originality**: Don't submit code you don't understand
4. **Disclosure**: Mention AI assistance in commit messages or PRs

### AI Tool Recommendations
- GitHub Copilot
- Cursor
- ChatGPT (for learning, not direct code copy)

## Quality Standards

All code must:
- Pass automated tests
- Follow project style guide
- Include appropriate documentation
- Be reviewed by at least one maintainer`,
    summary: 'Contributing guidelines focused on AI-assisted development. Provides clear boundaries on acceptable AI use, emphasizes human review and understanding, and recommends specific AI tools. Balances innovation with quality control.',
    tags: ['contributing', 'ai-assistance', 'code-review', 'guidelines'],
    ai_score: 78,
    upvotes_count: 89,
    downvotes_count: 15,
    language: 'en',
    created_at: '2024-01-08T13:20:00Z',
    repo: {
      id: 'repo-4',
      name: 'web-framework',
      full_name: 'startup/web-framework',
      stars: 567,
      forks: 78,
      language: 'JavaScript',
      url: 'https://github.com/startup/web-framework',
      updated_at: '2024-01-17T15:30:00Z',
    },
  },
  {
    id: '5',
    repo_id: 'repo-5',
    filename: 'AI_ETHICS.md',
    content: `# AI Ethics Framework

## Principles

### 1. Beneficence
AI systems should benefit humanity and improve human welfare.

### 2. Non-Maleficence
AI systems should not cause harm to individuals or groups.

### 3. Autonomy
AI should enhance, not replace, human decision-making.

### 4. Justice
AI systems should be fair and not discriminate.

### 5. Explicability
AI decisions should be understandable and explainable.

## Implementation

### Fairness
- Regular bias audits
- Diverse training data
- Representative evaluation sets

### Privacy
- Data minimization principles
- User consent for data use
- Right to explanation

### Accountability
- Clear responsibility chains
- Audit trails
- Redress mechanisms

## Review Process

All AI features must pass:
1. Ethics review
2. Bias assessment
3. Privacy impact analysis
4. User testing with diverse groups`,
    summary: 'Ethics framework for AI development based on core principles: beneficence, non-maleficence, autonomy, justice, and explicability. Includes practical implementation guidelines for fairness, privacy, and accountability with a structured review process.',
    tags: ['ethics', 'fairness', 'privacy', 'accountability', 'framework'],
    ai_score: 94,
    upvotes_count: 278,
    downvotes_count: 3,
    language: 'en',
    created_at: '2024-01-05T08:00:00Z',
    repo: {
      id: 'repo-5',
      name: 'ai-research',
      full_name: 'university/ai-research',
      stars: 2450,
      forks: 234,
      language: 'Python',
      url: 'https://github.com/university/ai-research',
      updated_at: '2024-01-21T10:15:00Z',
    },
  },
  {
    id: '6',
    repo_id: 'repo-6',
    filename: 'MODEL_GOVERNANCE.md',
    content: `# Model Governance Policy

## Model Lifecycle

### Development
- Clear documentation of model architecture
- Reproducible training pipelines
- Version control for models and data

### Testing
- Unit tests for model components
- Integration tests for full pipeline
- Performance benchmarks

### Deployment
- Gradual rollout strategy
- A/B testing framework
- Monitoring and alerting

### Maintenance
- Regular performance reviews
- Model retraining schedule
- Deprecation procedures

## Risk Management

### Risk Categories
1. **Performance Risk**: Model accuracy degradation
2. **Bias Risk**: Unfair outcomes for certain groups
3. **Security Risk**: Adversarial attacks
4. **Privacy Risk**: Data leakage

### Mitigation
- Regular risk assessments
- Contingency plans
- Incident response procedures

## Compliance

Models must comply with:
- GDPR (if processing EU data)
- Local data protection laws
- Industry-specific regulations`,
    summary: 'Comprehensive model governance policy covering the entire model lifecycle from development to maintenance. Includes risk management framework with categories and mitigation strategies, plus compliance requirements. Strong emphasis on documentation and reproducibility.',
    tags: ['model-governance', 'lifecycle', 'risk-management', 'compliance'],
    ai_score: 85,
    upvotes_count: 134,
    downvotes_count: 9,
    language: 'en',
    created_at: '2024-01-14T11:30:00Z',
    repo: {
      id: 'repo-6',
      name: 'enterprise-ai',
      full_name: 'enterprise/ai-platform',
      stars: 1567,
      forks: 189,
      language: 'Java',
      url: 'https://github.com/enterprise/ai-platform',
      updated_at: '2024-01-20T16:45:00Z',
    },
  },
];

/**
 * Get a policy by ID
 * 
 * @param id - Policy ID to retrieve
 * @returns Policy object or undefined if not found
 */
export function getPolicyById(id: string): Policy | undefined {
  return demoPolicies.find((policy) => policy.id === id);
}

/**
 * Get all policies
 * 
 * @returns Array of all demo policies
 */
export function getAllPolicies(): Policy[] {
  return demoPolicies;
}

/**
 * Search policies by query string
 * 
 * Searches in title (filename), summary, and tags
 * 
 * @param query - Search query string
 * @returns Array of matching policies
 */
export function searchPolicies(query: string): Policy[] {
  if (!query.trim()) {
    return demoPolicies;
  }

  const lowerQuery = query.toLowerCase();
  
  return demoPolicies.filter(
    (policy) =>
      policy.filename.toLowerCase().includes(lowerQuery) ||
      policy.summary.toLowerCase().includes(lowerQuery) ||
      policy.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Sort policies by various criteria
 * 
 * @param policies - Array of policies to sort
 * @param sortBy - Sort criteria: 'votes', 'recent', 'ai-score'
 * @returns Sorted array of policies
 */
export function sortPolicies(
  policies: Policy[],
  sortBy: 'votes' | 'recent' | 'ai-score'
): Policy[] {
  const sorted = [...policies];

  switch (sortBy) {
    case 'votes':
      // Sort by net votes (upvotes - downvotes), descending
      return sorted.sort(
        (a, b) =>
          b.upvotes_count - b.downvotes_count -
          (a.upvotes_count - a.downvotes_count)
      );
    case 'recent':
      // Sort by created_at, most recent first
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case 'ai-score':
      // Sort by AI score, highest first
      return sorted.sort((a, b) => b.ai_score - a.ai_score);
    default:
      return sorted;
  }
}

/**
 * Filter policies by language
 * 
 * @param policies - Array of policies to filter
 * @param language - Programming language to filter by (empty string = all)
 * @returns Filtered array of policies
 */
export function filterPoliciesByLanguage(
  policies: Policy[],
  language: string
): Policy[] {
  if (!language) return policies;
  return policies.filter((policy) => policy.repo.language === language);
}

/**
 * Filter policies by tag
 * 
 * @param policies - Array of policies to filter
 * @param tag - Tag to filter by (empty string = all)
 * @returns Filtered array of policies
 */
export function filterPoliciesByTag(
  policies: Policy[],
  tag: string
): Policy[] {
  if (!tag) return policies;
  return policies.filter((policy) =>
    policy.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}

/**
 * Filter policies by AI score range
 * 
 * @param policies - Array of policies to filter
 * @param minScore - Minimum AI score (0-100)
 * @param maxScore - Maximum AI score (0-100)
 * @returns Filtered array of policies
 */
export function filterPoliciesByScore(
  policies: Policy[],
  minScore: number = 0,
  maxScore: number = 100
): Policy[] {
  return policies.filter(
    (policy) =>
      policy.ai_score >= minScore && policy.ai_score <= maxScore
  );
}

/**
 * Get all unique languages from policies
 * 
 * @returns Array of unique language names
 */
export function getAllLanguages(): string[] {
  const languages = new Set<string>();
  demoPolicies.forEach((policy) => {
    if (policy.repo.language) {
      languages.add(policy.repo.language);
    }
  });
  return Array.from(languages).sort();
}

/**
 * Get all unique tags from policies
 * 
 * @returns Array of unique tag names
 */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  demoPolicies.forEach((policy) => {
    policy.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

