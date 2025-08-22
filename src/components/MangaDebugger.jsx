import { useState } from "react";

function MangaDebugger() {
  const [mangaId, setMangaId] = useState("");
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const testMangaFetch = async () => {
    if (!mangaId.trim()) return;

    setLoading(true);
    setDebugInfo(null);

    try {
      console.log("Debug: Testing manga ID:", mangaId);

      // Test manga details
      const mangaResponse = await fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/manga/${mangaId}?includes[]=cover_art&includes[]=author&includes[]=artist`
      );

      const mangaData = await mangaResponse.json();
      console.log("Debug: Manga response:", mangaData);

      // Test chapters with enhanced method
      const chaptersResponse = await fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/manga/${mangaId}/feed?translatedLanguage[]=en&order[volume]=asc&order[chapter]=asc&limit=10&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica`
      );

      const chaptersData = await chaptersResponse.json();
      console.log("Debug: Chapters response:", chaptersData);

      // Test basic chapters method if enhanced fails
      let basicChaptersData = null;
      if (!chaptersData?.data || chaptersData.data.length === 0) {
        console.log("Debug: Trying basic chapters fetch...");
        const basicResponse = await fetch(
          `${
            import.meta.env.VITE_BASE_URL
          }/manga/${mangaId}/feed?translatedLanguage[]=en&order[chapter]=asc&limit=10`
        );
        basicChaptersData = await basicResponse.json();
        console.log("Debug: Basic chapters response:", basicChaptersData);
      }

      setDebugInfo({
        mangaStatus: mangaResponse.status,
        mangaValid: mangaData?.data ? true : false,
        mangaTitle: mangaData?.data?.attributes?.title?.en || "N/A",
        chaptersStatus: chaptersResponse.status,
        chaptersCount: chaptersData?.data?.length || 0,
        basicChaptersCount: basicChaptersData?.data?.length || 0,
        chaptersData: chaptersData?.data?.slice(0, 3) || [], // First 3 chapters for preview
        basicChaptersData: basicChaptersData?.data?.slice(0, 3) || [],
        apiEndpoint: import.meta.env.VITE_BASE_URL,
      });
    } catch (error) {
      console.error("Debug error:", error);
      setDebugInfo({
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        right: 10,
        background: "white",
        border: "1px solid #ccc",
        padding: "10px",
        borderRadius: "4px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        maxWidth: "300px",
        zIndex: 1000,
      }}
    >
      <h4>Manga Debugger</h4>
      <input
        type="text"
        placeholder="Enter Manga ID"
        value={mangaId}
        onChange={(e) => setMangaId(e.target.value)}
        style={{ width: "100%", margin: "5px 0" }}
      />
      <button
        onClick={testMangaFetch}
        disabled={loading}
        style={{ width: "100%", padding: "5px" }}
      >
        {loading ? "Testing..." : "Test Fetch"}
      </button>

      {debugInfo && (
        <div style={{ marginTop: "10px", fontSize: "12px" }}>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "5px",
              borderRadius: "3px",
              overflow: "auto",
              maxHeight: "200px",
            }}
          >
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default MangaDebugger;
