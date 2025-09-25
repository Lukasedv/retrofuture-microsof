// CVE-005: IDOR Vulnerability - Document viewer with direct object reference
// This component demonstrates insecure document access without ownership validation

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getDocument, getAllDocuments, getDocumentsByUser } from '../api/documents.js';

interface Document {
  id: number;
  title: string;
  content: string;
  ownerId: number;
  type: string;
  createdAt: string;
}

interface DocumentSummary {
  id: number;
  title: string;
  ownerId: number;
  type: string;
  createdAt: string;
}

interface Props {
  setCurrentScreen: (screen: string) => void;
}

export default function DocumentViewer({ setCurrentScreen }: Props) {
  const [documentId, setDocumentId] = useState('1001');
  const [document, setDocument] = useState<Document | null>(null);
  const [allDocuments, setAllDocuments] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAllDocs, setShowAllDocs] = useState(false);

  const loadDocument = async (id: string) => {
    setLoading(true);
    setError('');
    
    try {
      // VULNERABILITY: Direct API call with user-controlled document ID
      const result = getDocument(id);
      
      if (result.error) {
        setError(result.error);
        setDocument(null);
      } else {
        setDocument(result.document);
      }
    } catch (err) {
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const loadAllDocuments = () => {
    // VULNERABILITY: Exposes all document metadata
    const result = getAllDocuments();
    if (result.success) {
      setAllDocuments(result.documents);
      setShowAllDocs(true);
    }
  };

  useEffect(() => {
    loadDocument(documentId);
  }, [documentId]);

  const handleDocumentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDocId = e.target.value;
    setDocumentId(newDocId);
  };

  const selectDocument = (id: number) => {
    setDocumentId(id.toString());
    setShowAllDocs(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'confidential': return 'bg-red-500';
      case 'financial': return 'bg-yellow-500';
      case 'hr': return 'bg-purple-500';
      case 'personal_data': return 'bg-red-700';
      case 'internal': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getUserName = (ownerId: number) => {
    const userNames: {[key: number]: string} = {
      1: 'admin',
      2: 'john_doe',
      3: 'jane_smith',
      4: 'security_officer'
    };
    return userNames[ownerId] || 'unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold terminal-glow text-accent">DOCUMENT_VIEWER.EXE</h1>
        <Button 
          onClick={() => setCurrentScreen('main')}
          variant="ghost" 
          className="text-muted-foreground hover:text-primary"
        >
          [ BACK ] &lt;&lt;
        </Button>
      </div>

      <div className="terminal-text space-y-4">
        <div className="text-accent font-bold">&gt; ACCESS DOCUMENT DATABASE</div>
        <div className="text-sm text-muted-foreground">
          VULNERABILITY: Direct document access without ownership verification
        </div>
        
        <div className="flex gap-4 items-center">
          <label className="text-primary">DOCUMENT_ID:</label>
          <Input 
            value={documentId}
            onChange={handleDocumentIdChange}
            placeholder="Enter document ID (1001-1005)"
            className="w-48 terminal-border"
            type="number"
            min="1000"
            max="2000"
          />
          <Button 
            onClick={() => loadDocument(documentId)}
            className="terminal-border border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            disabled={loading}
          >
            {loading ? 'LOADING...' : 'ACCESS'}
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={() => selectDocument(1001)}
            variant="outline"
            size="sm"
            className="terminal-border border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
          >
            AUDIT REPORT (1001)
          </Button>
          <Button 
            onClick={() => selectDocument(1002)}
            variant="outline"
            size="sm"
            className="terminal-border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
          >
            HR REVIEW (1002)
          </Button>
          <Button 
            onClick={() => selectDocument(1003)}
            variant="outline"
            size="sm"
            className="terminal-border border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-white"
          >
            FINANCIAL (1003)
          </Button>
          <Button 
            onClick={() => selectDocument(1004)}
            variant="outline"
            size="sm"
            className="terminal-border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
          >
            MEETING NOTES (1004)
          </Button>
          <Button 
            onClick={() => selectDocument(1005)}
            variant="outline"
            size="sm"
            className="terminal-border border-red-700 text-red-300 hover:bg-red-700 hover:text-white"
          >
            PERSONAL DATA (1005)
          </Button>
        </div>

        <Button 
          onClick={loadAllDocuments}
          variant="outline"
          className="terminal-border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          SHOW ALL DOCUMENTS
        </Button>
      </div>

      {error && (
        <Card className="terminal-border bg-red-900/20 border-red-500">
          <CardContent className="p-4">
            <div className="text-red-400">ERROR: {error}</div>
          </CardContent>
        </Card>
      )}

      {showAllDocs && allDocuments.length > 0 && (
        <Card className="terminal-border bg-secondary">
          <CardHeader>
            <CardTitle className="text-accent">DOCUMENT DATABASE - ALL ENTRIES</CardTitle>
            <div className="text-sm text-red-400">⚠️ Exposing all document metadata without authorization</div>
          </CardHeader>
          <CardContent className="space-y-2">
            {allDocuments.map((doc) => (
              <div 
                key={doc.id}
                className="flex items-center justify-between p-2 border border-primary/20 cursor-pointer hover:bg-primary/10"
                onClick={() => selectDocument(doc.id)}
              >
                <div className="flex items-center gap-3">
                  <Badge className={getTypeColor(doc.type)}>
                    {doc.type.toUpperCase()}
                  </Badge>
                  <span className="text-primary">ID: {doc.id}</span>
                  <span>{doc.title}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Owner: {getUserName(doc.ownerId)} | {doc.createdAt}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {document && (
        <Card className="terminal-border bg-secondary">
          <CardHeader>
            <CardTitle className="text-accent">DOCUMENT #{document.id}</CardTitle>
            <div className="flex gap-2 items-center">
              <Badge className={getTypeColor(document.type)}>
                {document.type.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="border-primary text-primary">
                Owner: {getUserName(document.ownerId)}
              </Badge>
              <Badge variant="outline" className="border-muted text-muted-foreground">
                {document.createdAt}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 terminal-text">
            <div>
              <div className="text-primary font-bold">TITLE:</div>
              <div>{document.title}</div>
            </div>
            
            <Separator className="bg-primary/20" />
            
            <div>
              <div className="text-primary font-bold">CONTENT:</div>
              <div className="mt-2 p-4 bg-black/50 border border-accent rounded">
                <pre className="whitespace-pre-wrap text-sm">{document.content}</pre>
              </div>
            </div>

            {(document.type === 'confidential' || document.type === 'personal_data' || document.type === 'financial') && (
              <div className="border border-red-500 bg-red-900/20 p-4 rounded">
                <div className="text-red-400 font-bold">🚨 HIGHLY SENSITIVE CONTENT EXPOSED 🚨</div>
                <div className="text-red-300 text-sm mt-1">
                  This document contains sensitive information that should not be accessible to unauthorized users.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="mt-8 p-4 border border-red-500 bg-red-900/10">
        <div className="text-red-400 font-bold">SECURITY VULNERABILITY DETECTED</div>
        <div className="text-red-300 text-sm mt-2">
          This interface demonstrates Insecure Direct Object References (IDOR) in document access. 
          Users can access any document by manipulating the document ID, including confidential reports, 
          HR records, financial data, and personal information belonging to other users.
        </div>
        <div className="text-red-300 text-sm mt-1">
          <strong>CVE Classification:</strong> CWE-639 (Authorization Bypass Through User-Controlled Key), CWE-284 (Improper Access Control)
        </div>
      </div>
    </div>
  );
}