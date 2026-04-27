/**
 * CsvUpload — drag-and-drop or click-to-upload DKB CSV importer.
 *
 * Props:
 * - onSuccess: (result) => void  — called with ImportResult after a successful upload
 */
import { useState, useRef } from "react";
import { useImportCsv } from "../hooks/useFinance";

function CsvUpload({ onSuccess }) {
    const [dragging, setDragging] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const inputRef = useRef();

    const { mutateAsync: importCsv, isPending} = useImportCsv();

    const handleFile = async (file) => {
        if (!file) return;
        if (!file.name.endsWith(".csv")) {
            setError("Only .csv Files are allowed for upload")
            return;
        }
        setError("")
        setResult(null)
        try {
            const res = await importCsv(file);
            setResult(res);
            onSuccess?.(res)
        }catch (err){
            setError(err.message ?? "Upload failed.");
        }
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragging(false)
        handleFile(e.dataTransfer.files[0]);
    };

    return (
        <div className="csv-upload">
            <div
                className={`csv-drop-zone ${dragging ? "dragging" : ""} ${isPending ? "uploading" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => !isPending && inputRef.current?.click()}
            >
                <input 
                    ref={inputRef}
                    type="file"
                    accept=".csv"
                    style={{ display: "none" }}
                    onChange={(e) => handleFile(e.target.files[0])}
                />

                {isPending ? (
                    <div className="csv-uploading">
                        <div className="csv-spinner" />
                        <span>Importing transactions...</span>
                    </div>
                ) :(
                    <>
                        <div className="csv-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>
                        <p className="csv-hint-main">Drop your DKB CSV here</p>
                        <p className="csv-hint-sub">or click to browse · .csv files only</p>
                    </>
                )}
            </div>

            {error && (
                <div className="csv-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>
                        Imported <stron>{result.imported}</stron> transactions
                        {result.skipped > 0 && `, skipped ${result.skipped} duplicates`}
                    </span>
                </div>
            )}
        </div>
    )
}

export const csvUploadStyles = `
  .csv-upload { width: 100%; }
 
  .csv-drop-zone {
    border: 2px dashed #d1d5db;
    border-radius: 12px;
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    cursor: pointer;
    background: #fafaf9;
    transition: all 0.2s;
    min-height: 160px;
  }
  .csv-drop-zone:hover, .csv-drop-zone.dragging {
    border-color: #2563eb;
    background: #eff6ff;
  }
  .csv-drop-zone.uploading { cursor: not-allowed; opacity: 0.7; }
 
  .csv-icon { color: #9ca3af; margin-bottom: 0.25rem; }
  .csv-drop-zone.dragging .csv-icon { color: #2563eb; }
 
  .csv-hint-main {
    font-size: 0.9rem;
    font-weight: 500;
    color: #374151;
    margin: 0;
  }
  .csv-hint-sub {
    font-size: 0.75rem;
    color: #9ca3af;
    margin: 0;
  }
 
  .csv-uploading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    color: #6b7280;
    font-size: 0.85rem;
  }
 
  .csv-spinner {
    width: 28px; height: 28px;
    border: 2px solid #e5e7eb;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
 
  .csv-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
    padding: 0.6rem 1rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 7px;
    color: #dc2626;
    font-size: 0.82rem;
  }
 
  .csv-result {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
    padding: 0.6rem 1rem;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 7px;
    color: #15803d;
    font-size: 0.82rem;
  }
`;
 
export default CsvUpload;