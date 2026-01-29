import React, { useRef, useState } from "react";
import { useTreeContext } from "@/contexts/TreeContext";
import { usePromptContext } from "@/contexts/PromptContext";
import { FolderType } from "@/types";
import { mergeTreeData } from "@/utils/treeUtils";
import { loadJSONFile } from "@/utils/fileUtils";
import { v4 as uuidv4 } from 'uuid';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

const FileControls: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { treeData, setTreeData } = useTreeContext();
  const { prompts, setPrompts } = usePromptContext();
  const [isSyncing, setIsSyncing] = useState(false);

  // Handle local file upload (Legacy JSON or New Bundle)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await loadJSONFile(file);

      // Check if it is a legacy full export or new sync bundle
      let componentsToMerge = [];
      if ('tree' in data && Array.isArray(data.tree)) {
        // Legacy format
        componentsToMerge = data.tree;
      } else if ('components' in data && Array.isArray(data.components)) {
        // New Bundle format
        componentsToMerge = data.components;
        if ('prompts' in data && Array.isArray(data.prompts)) {
          if (confirm(`Nalezeno ${data.prompts.length} promptů. Přepsat aktuální prompty?`)) {
            setPrompts(data.prompts);
          }
        }
      } else {
        throw new Error("Neplatný formát souboru.");
      }

      setTreeData((currentTreeData: FolderType[]) => {
        return mergeTreeData(currentTreeData, componentsToMerge, uuidv4);
      });

      if (fileInputRef.current) fileInputRef.current.value = "";
      alert("Import úspěšný.");
    } catch (error) {
      console.error("Error loading file:", error);
      alert(`Chyba při načítání souboru: ${(error as Error).message}`);
    }
  };

  const handleSave = () => {
    try {
      const exportData = {
        components: treeData,
        prompts: prompts,
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "prompt-builder-backup.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error saving file:", error);
      alert(`Chyba při ukládání souboru: ${(error as Error).message}`);
    }
  };

  const handleSyncToCloud = async () => {
    if (!confirm("Tímto přepíšete data na GitHubu aktuálním lokálním stavem. Pokračovat?")) return;
    setIsSyncing(true);
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          components: treeData,
          prompts: prompts,
          lastUpdated: new Date().toISOString(),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Synchronizace selhala");
      alert("Úspěšně uloženo na GitHub!");
    } catch (error: any) {
      alert(`Synchronizace selhala: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLoadFromCloud = async () => {
    if (!confirm("Tímto nahradíte aktuální Prompty a sloučíte komponenty s daty z GitHubu. Pokračovat?")) return;
    setIsSyncing(true);
    try {
      const response = await fetch('/api/sync');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Načtení selhalo");

      if (!data || (!data.components && !data.prompts)) {
        alert("Na GitHubu nebyla nalezena žádná data.");
        return;
      }

      if (data.components) {
        setTreeData((currentTreeData: FolderType[]) => {
          return mergeTreeData(currentTreeData, data.components, uuidv4);
        });
      }
      if (data.prompts) {
        setPrompts(data.prompts);
      }
      alert("Úspěšně načteno z GitHubu!");
    } catch (error: any) {
      alert(`Načtení selhalo: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="file-controls">
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <button
          className="file-btn save-btn"
          onClick={handleSyncToCloud}
          disabled={isSyncing}
          title="Sync na GitHub"
          style={{ backgroundColor: '#2ea44f', color: 'white', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {isSyncing ? "..." : <><CloudUploadIcon fontSize="small" style={{ marginRight: 4 }} /> Sync Uložit</>}
        </button>
        <button
          className="file-btn load-btn"
          onClick={handleLoadFromCloud}
          disabled={isSyncing}
          title="Načíst z GitHubu"
          style={{ backgroundColor: '#0366d6', color: 'white', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {isSyncing ? "..." : <><CloudDownloadIcon fontSize="small" style={{ marginRight: 4 }} /> Sync Načíst</>}
        </button>
      </div>

      <div className="load-save-controls">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".json"
          style={{ display: "none" }}
        />
        <button
          className="file-btn load-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Importovat zálohu"
        >
          Import
        </button>
        <button
          className="file-btn save-btn"
          onClick={handleSave}
          title="Exportovat zálohu"
        >
          Export
        </button>
      </div>
    </div>
  );
};

export default FileControls;