import React, { useState, useCallback, useEffect, useRef } from "react";
import { X, Plus, Globe, Server, Database, Plug, Cloud, type LucideIcon } from "lucide-react";
import { NodeType } from "../../types/graph";

const nodeTypeOptions: { value: NodeType; label: string; icon: LucideIcon; description: string }[] = [
  { value: "frontend", label: "Frontend", icon: Globe, description: "Web or mobile UI" },
  { value: "api", label: "API", icon: Plug, description: "REST or GraphQL endpoints" },
  { value: "service", label: "Service", icon: Server, description: "Backend microservice" },
  { value: "database", label: "Database", icon: Database, description: "Data storage" },
  { value: "external", label: "External", icon: Cloud, description: "Third-party integration" },
];

interface AddNodeFormProps {
  onSubmit: (type: NodeType, label: string, description: string) => void;
  onCancel: () => void;
  position: { x: number; y: number };
}

export const AddNodeForm: React.FC<AddNodeFormProps> = ({
  onSubmit,
  onCancel,
  position,
}) => {
  const [type, setType] = useState<NodeType>("frontend");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onCancel]);

  const handleSubmit = useCallback(() => {
    if (!label.trim()) return;
    onSubmit(type, label.trim(), description.trim());
  }, [type, label, description, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "Escape") {
        onCancel();
      }
    },
    [handleSubmit, onCancel]
  );

  const selectedOption = nodeTypeOptions.find((o) => o.value === type)!;

  return (
    <div
      ref={formRef}
      className="absolute z-50 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-4 w-72"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, 0)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-100 font-medium text-sm">Add New Node</h3>
        <button
          onClick={onCancel}
          className="text-slate-500 hover:text-slate-300 transition-colors p-1"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">Type</label>
          <div className="relative">
            <button
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-200 hover:border-slate-500/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <selectedOption.icon size={14} className="text-slate-400" />
                <span>{selectedOption.label}</span>
              </div>
              <span className="text-slate-500 text-xs">▼</span>
            </button>

            {isTypeDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden z-10">
                {nodeTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setType(option.value);
                      setIsTypeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-700/50 transition-colors ${
                      type === option.value ? "bg-violet-500/10" : ""
                    }`}
                  >
                    <option.icon size={14} className="text-slate-400" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-200">{option.label}</div>
                      <div className="text-xs text-slate-500">{option.description}</div>
                    </div>
                    {type === option.value && (
                      <div className="w-2 h-2 rounded-full bg-violet-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5">
            Label <span className="text-red-400">*</span>
          </label>
          <input
            ref={inputRef}
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., User Dashboard"
            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Optional description"
            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={onCancel}
          className="flex-1 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg text-sm text-slate-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!label.trim()}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-violet-500 hover:bg-violet-400 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg text-sm text-white font-medium transition-colors"
        >
          <Plus size={14} />
          Add Node
        </button>
      </div>
    </div>
  );
};
