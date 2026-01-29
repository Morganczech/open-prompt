"use client";

/**
 * ComponentModal
 * Modal for adding and editing components
 */

import React, { useState, useEffect } from "react";
import ModalBase from "./ModalBase";
import { useTreeContext } from "../../contexts/TreeContext";

const ComponentModal: React.FC = () => {
  const {
    isComponentModalOpen,
    setComponentModalOpen,
    componentBeingEdited,
    selectedNode,
    handleAddComponent,
    handleUpdateComponent
  } = useTreeContext();

  const [componentName, setComponentName] = useState("");
  const [componentContent, setComponentContent] = useState("");
  const [componentType, setComponentType] = useState<"instruction" | "role" | "context" | "format" | "style">("instruction");
  const [error, setError] = useState("");

  // Reset form when modal opens/closes or editing component changes
  useEffect(() => {
    if (isComponentModalOpen) {
      if (componentBeingEdited) {
        // Editing an existing component
        setComponentName(componentBeingEdited.name);
        setComponentContent(componentBeingEdited.content);
        setComponentType(componentBeingEdited.componentType);
      } else {
        // Adding a new component
        setComponentName("");
        setComponentContent("");
        setComponentType("instruction");
      }
      setError("");
    }
  }, [isComponentModalOpen, componentBeingEdited]);

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!componentName.trim()) {
      setError("Název komponenty je povinný");
      return;
    }

    if (componentBeingEdited) {
      // Update existing component
      handleUpdateComponent({
        ...componentBeingEdited,
        name: componentName.trim(),
        content: componentContent,
        componentType: componentType
      });
    } else if (selectedNode && selectedNode.type === "folder") {
      // Add new component
      handleAddComponent(selectedNode.id, {
        name: componentName.trim(),
        content: componentContent,
        componentType: componentType
      });
    }

    setComponentModalOpen(false);
  };

  return (
    <ModalBase
      isOpen={isComponentModalOpen}
      onClose={() => setComponentModalOpen(false)}
      title={componentBeingEdited ? "Upravit komponentu" : "Přidat komponentu"}
      className="component-modal"
    >
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="componentName">Název:</label>
          <input
            id="componentName"
            type="text"
            value={componentName}
            onChange={(e) => setComponentName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="componentType">Typ:</label>
          <select
            id="componentType"
            value={componentType}
            onChange={(e) => setComponentType(e.target.value as any)}
          >
            <option value="instruction">Instrukce</option>
            <option value="role">Role</option>
            <option value="context">Kontext</option>
            <option value="format">Formát</option>
            <option value="style">Styl</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="componentContent">Obsah:</label>
          <textarea
            id="componentContent"
            value={componentContent}
            onChange={(e) => setComponentContent(e.target.value)}
            rows={10}
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => setComponentModalOpen(false)}>Zrušit</button>
          <button type="submit" className="primary">
            {componentBeingEdited ? "Potvrdit" : "Vytvořit"}
          </button>
        </div>
      </form>
    </ModalBase>
  );
};

export default ComponentModal;