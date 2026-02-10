/** @jest-environment jsdom */
/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */

import React from 'react';
import { render } from '@testing-library/react';

type LinkProps = {
  href: string;
  children?: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

jest.mock('next/link', () => {
  const LinkMock = ({ href, children, ...props }: LinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  LinkMock.displayName = 'Link';
  return LinkMock;
});

jest.mock('@/components/mobile-nav', () => ({
  MobileNav: () => <nav data-testid="mobile-nav" />,
}));

jest.mock('@/components/footer', () => ({
  Footer: () => <footer data-testid="footer" />,
}));

jest.mock('@/components/global-nav', () => ({
  GlobalNav: () => <nav data-testid="global-nav" />,
}));

jest.mock('@/components/breadcrumbs', () => ({
  Breadcrumbs: () => <div data-testid="breadcrumbs" />,
}));

jest.mock('lucide-react', () => ({
  Clock: () => <span data-testid="clock-icon" />,
  Layers: () => <span data-testid="layers-icon" />,
  Zap: () => <span data-testid="zap-icon" />,
  ArrowRight: () => <span data-testid="arrow-right-icon" />,
  Check: () => <span data-testid="check-icon" />,
  ExternalLink: () => <span data-testid="external-link-icon" />,
}));

import WorkflowsPage from '@/app/workflows/page';
import WorkflowDetailPage from '@/app/workflows/[id]/page';

describe.skip('Workflows Pages Render Tests', () => {
  test('Workflows index page renders without crashing', () => {
    const { container } = render(<WorkflowsPage />);
    expect(container).toBeInTheDocument();
  });

  test('Workflows index page displays workflow cards', () => {
    const { container } = render(<WorkflowsPage />);
    const text = container.textContent || '';
    
    // Should show some of the workflows
    expect(text).toContain('Workflow Templates');
  });

  test('Workflow detail page renders without crashing', async () => {
    const params = Promise.resolve({ id: 'code-review-pipeline' });
    const { container } = render(await WorkflowDetailPage({ params }));
    expect(container).toBeInTheDocument();
  });

  test('Workflow detail page displays workflow information', async () => {
    const params = Promise.resolve({ id: 'code-review-pipeline' });
    const { container } = render(await WorkflowDetailPage({ params }));
    const text = container.textContent || '';
    
    // Should show workflow details
    expect(text).toContain('Code Review Pipeline');
    expect(text).toContain('Workflow Steps');
  });

  test('Workflow detail page handles all workflow IDs', async () => {
    const workflowIds = [
      'code-review-pipeline',
      'content-publishing',
      'data-analysis',
      'bug-triage',
      'deployment',
      'security-audit',
      'onboarding',
      'monitoring'
    ];

    for (const id of workflowIds) {
      const params = Promise.resolve({ id });
      const { container } = render(await WorkflowDetailPage({ params }));
      expect(container).toBeInTheDocument();
    }
  });
});

describe.skip('Workflows Data Tests', () => {
  test('Workflow data structure is valid', () => {
    const { getWorkflows } = require('@/lib/data');
    const workflows = getWorkflows();
    
    expect(Array.isArray(workflows)).toBe(true);
    expect(workflows.length).toBe(8);
    
    workflows.forEach((workflow: any) => {
      expect(workflow).toHaveProperty('id');
      expect(workflow).toHaveProperty('name');
      expect(workflow).toHaveProperty('description');
      expect(workflow).toHaveProperty('category');
      expect(workflow).toHaveProperty('difficulty');
      expect(workflow).toHaveProperty('estimatedTime');
      expect(workflow).toHaveProperty('tags');
      expect(workflow).toHaveProperty('requiredSkills');
      expect(workflow).toHaveProperty('steps');
      expect(Array.isArray(workflow.steps)).toBe(true);
    });
  });

  test('Workflow steps have required fields', () => {
    const { getWorkflows } = require('@/lib/data');
    const workflows = getWorkflows();
    
    workflows.forEach((workflow: any) => {
      workflow.steps.forEach((step: any) => {
        expect(step).toHaveProperty('id');
        expect(step).toHaveProperty('name');
        expect(step).toHaveProperty('description');
        expect(step).toHaveProperty('skills');
        expect(step).toHaveProperty('automated');
        expect(typeof step.automated).toBe('boolean');
      });
    });
  });

  test('getWorkflowById returns correct workflow', () => {
    const { getWorkflowById } = require('@/lib/data');
    
    const workflow = getWorkflowById('code-review-pipeline');
    expect(workflow).toBeDefined();
    expect(workflow?.name).toBe('Code Review Pipeline');
  });

  test('getWorkflowsByCategory filters correctly', () => {
    const { getWorkflowsByCategory } = require('@/lib/data');
    
    const devWorkflows = getWorkflowsByCategory('development');
    expect(Array.isArray(devWorkflows)).toBe(true);
    devWorkflows.forEach((w: any) => {
      expect(w.category).toBe('development');
    });
  });

  test('getWorkflowsByDifficulty filters correctly', () => {
    const { getWorkflowsByDifficulty } = require('@/lib/data');
    
    const advancedWorkflows = getWorkflowsByDifficulty('advanced');
    expect(Array.isArray(advancedWorkflows)).toBe(true);
    advancedWorkflows.forEach((w: any) => {
      expect(w.difficulty).toBe('advanced');
    });
  });
});
