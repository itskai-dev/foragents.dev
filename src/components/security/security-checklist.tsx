"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Circle } from 'lucide-react';

const checklistItems = [
  {
    id: 1,
    title: 'API keys are stored securely and never committed to version control',
    description: 'Use environment variables or secret management systems for API keys',
  },
  {
    id: 2,
    title: 'Rate limiting is implemented on all agent-facing endpoints',
    description: 'Prevent abuse and ensure fair resource allocation',
  },
  {
    id: 3,
    title: 'Input validation and sanitization is applied to all user data',
    description: 'Protect against injection attacks and malformed data',
  },
  {
    id: 4,
    title: 'HTTPS/TLS encryption is enforced for all communications',
    description: 'Ensure data in transit is protected from interception',
  },
  {
    id: 5,
    title: 'Authentication tokens have appropriate expiration times',
    description: 'Reduce risk from compromised credentials with time-limited tokens',
  },
  {
    id: 6,
    title: 'Audit logging is enabled for all security-relevant events',
    description: 'Maintain comprehensive records for security analysis and compliance',
  },
  {
    id: 7,
    title: 'Dependencies are regularly updated and scanned for vulnerabilities',
    description: 'Stay ahead of known security issues in third-party code',
  },
  {
    id: 8,
    title: 'Principle of least privilege is applied to all access controls',
    description: 'Grant only the minimum permissions necessary for each role',
  },
  {
    id: 9,
    title: 'Backup and disaster recovery procedures are tested regularly',
    description: 'Ensure business continuity in case of security incidents',
  },
  {
    id: 10,
    title: 'Security incident response plan is documented and accessible',
    description: 'Be prepared to respond quickly and effectively to security events',
  },
];

export function SecurityChecklist() {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggleItem = (id: number) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const completionPercentage = Math.round((checkedItems.size / checklistItems.length) * 100);

  return (
    <Card className="bg-[#0f0f0f] border-white/10 p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-semibold mb-2">Security Checklist for AI Agents</h2>
        <p className="text-gray-400">
          Essential security practices every agent should verify before deployment.
        </p>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm font-semibold" style={{ color: '#06D6A0' }}>
              {checkedItems.size}/{checklistItems.length} completed ({completionPercentage}%)
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: '#06D6A0',
                width: `${completionPercentage}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {checklistItems.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className="flex items-start gap-4 p-4 rounded-lg border border-white/5 hover:border-[#06D6A0]/30 transition-all cursor-pointer group"
          >
            <div className="flex-shrink-0 mt-1">
              {checkedItems.has(item.id) ? (
                <CheckCircle2 className="w-6 h-6" style={{ color: '#06D6A0' }} />
              ) : (
                <Circle className="w-6 h-6 text-gray-600 group-hover:text-gray-400 transition-colors" />
              )}
            </div>
            <div className="flex-grow">
              <h3 className={`font-medium mb-1 transition-colors ${
                checkedItems.has(item.id) ? 'text-gray-400 line-through' : 'text-white'
              }`}>
                {item.title}
              </h3>
              <p className="text-sm text-gray-500">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {completionPercentage === 100 && (
        <div className="mt-6 p-4 bg-[#06D6A0]/10 border border-[#06D6A0]/30 rounded-lg">
          <p className="text-center font-semibold" style={{ color: '#06D6A0' }}>
            ✓ Excellent! All security checks completed.
          </p>
        </div>
      )}
    </Card>
  );
}
