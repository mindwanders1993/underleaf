import React, { useState, useEffect, useRef } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import './EditorLayout.css';
import SidebarPlaceholder from '../sidebar/SidebarPlaceholder';
import MonacoEditor from '../editor/MonacoEditor';
import PreviewPlaceholder from '../preview/PreviewPlaceholder';
import { FileCode, FileText, FolderTree } from 'lucide-react';

const EditorLayout = () => {
  const { uiState, setUIState } = useProjectStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [editorWidth, setEditorWidth] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  
  const layoutRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current || !layoutRef.current) return;
    
    // Calculate new width as a percentage of the available space (excluding sidebar)
    // For simplicity, we just use the mouse clientX relative to window width 
    // This is a basic approximation for the prototype.
    const containerWidth = window.innerWidth;
    const sidebarWidth = 250; // matches CSS
    const availableWidth = containerWidth - sidebarWidth;
    
    // Prevent dragging too far
    let newWidthPct = ((e.clientX - sidebarWidth) / availableWidth) * 100;
    if (newWidthPct < 20) newWidthPct = 20;
    if (newWidthPct > 80) newWidthPct = 80;
    
    setEditorWidth(newWidthPct);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const renderMobileTabs = () => (
    <div className="ul-mobile-tabs">
      <button 
        className={`ul-mobile-tab-btn ${uiState.activePanel === 'files' ? 'active' : ''}`}
        onClick={() => setUIState({ activePanel: 'files' })}
      >
        <FolderTree size={20} />
        <span>Files</span>
      </button>
      <button 
        className={`ul-mobile-tab-btn ${uiState.activePanel === 'editor' ? 'active' : ''}`}
        onClick={() => setUIState({ activePanel: 'editor' })}
      >
        <FileCode size={20} />
        <span>Edit</span>
      </button>
      <button 
        className={`ul-mobile-tab-btn ${uiState.activePanel === 'preview' ? 'active' : ''}`}
        onClick={() => setUIState({ activePanel: 'preview' })}
      >
        <FileText size={20} />
        <span>PDF</span>
      </button>
    </div>
  );

  return (
    <div className={`ul-editor-layout ${isDragging ? 'is-dragging' : ''}`} ref={layoutRef}>
      <div className="ul-main-area" style={{ display: 'flex', flex: 1, minHeight: 0, width: '100%' }}>
        
        {/* Sidebar */}
        <div 
          className={`ul-sidebar ${uiState.sidebarOpen ? 'open' : ''}`}
          style={isMobile ? { display: uiState.activePanel === 'files' ? 'flex' : 'none' } : {}}
        >
          <SidebarPlaceholder />
        </div>

        {/* Editor Pane */}
        <div 
          className="ul-editor-pane"
          style={
            isMobile 
              ? { display: uiState.activePanel === 'editor' ? 'flex' : 'none' } 
              : { width: `${editorWidth}%`, flexGrow: 0 }
          }
        >
          <MonacoEditor />
        </div>

        {/* Resizer - Hidden on mobile */}
        {!isMobile && (
          <div 
            className="ul-resizer" 
            onMouseDown={handleMouseDown}
          />
        )}

        {/* Preview Pane */}
        <div 
          className="ul-preview-pane"
          style={
            isMobile 
              ? { display: uiState.activePanel === 'preview' ? 'flex' : 'none' } 
              : { flexGrow: 1 }
          }
        >
          <PreviewPlaceholder />
        </div>

      </div>

      {isMobile && renderMobileTabs()}
    </div>
  );
};

export default EditorLayout;
