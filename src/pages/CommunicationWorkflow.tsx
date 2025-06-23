import React from 'react';
import { CommunicationWorkflow as CommunicationWorkflowComponent } from '@/workflows/CommunicationWorkflow';

export function CommunicationWorkflow() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Workflow de Comunicação</h1>
        <p className="text-gray-600 mt-2">
          Crie e envie comunicações efetivas com ajuda da IA
        </p>
      </div>
      <CommunicationWorkflowComponent />
    </div>
  );
}