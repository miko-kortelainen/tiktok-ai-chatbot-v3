import { useEffect, useState } from "react";
import "../css/PromptEditPanel.css";
import { updatePrompts } from "../../services/endpoints";

export type Prompts = {
  defaultPrompt: string | undefined;
  followerPrompt: string | undefined;
  friendPrompt: string | undefined;
};

function PromptEditPanel() {
  const [selectedOption, setSelectedOption] = useState("defaultPrompt");
  const [applyStatus, setApplyStatus] = useState<string>("");
  const [prompts, setPrompts] = useState<Prompts>({ defaultPrompt: "", followerPrompt: "", friendPrompt: "" });

  // Load prompts from local storage on component mount
  useEffect(() => {
    const savedPrompts = localStorage.getItem("prompts");
    if (savedPrompts) {
      setPrompts(JSON.parse(savedPrompts));
    }
  }, []);

  const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedContent = {
      ...prompts,
      [selectedOption]: e.target.value,
    };
    setPrompts(updatedContent);

    // Save to local storage whenever text content changes
    localStorage.setItem("prompts", JSON.stringify(updatedContent));
  };

  // sends the prompts to the backend
  async function handleApplyPrompts() {
    setApplyStatus("Updating prompts...");

    const success = await updatePrompts(prompts);
    if (!success) {
      setApplyStatus("Error");
      return;
    }

    setApplyStatus("Prompts updated!");
    setTimeout(() => setApplyStatus(""), 4000);
  }

  const selectPromptType = (
    <select value={selectedOption} onChange={handleOptionChange} className="prompt-edit-select">
      <option value="defaultPrompt">Default</option>
      <option value="followerPrompt">Follower</option>
      <option value="friendPrompt">Friend</option>
    </select>
  );

  return (
    <div className="prompt-edit-panel">
      <div className="prompt-edit-panel-header">
        <h1>Prompt Edit Panel</h1>
        <p>System prompts for different follow roles.</p>
      </div>
      <div className="prompt-edit-panel-body">
        {selectPromptType}
        <textarea
          spellCheck="false"
          onChange={handleTextChange}
          placeholder="Enter text here"
          className="prompt-edit-textarea"
          required
        />
        <button
          onClick={handleApplyPrompts}
          className="prompt-edit-button apply-button"
          disabled={applyStatus === "applying"}
        >
          {applyStatus === "applying" ? "Applying..." : "Apply"}
        </button>
        {applyStatus === "success" && <div className="apply-status success">Prompts updated successfully!</div>}
        {applyStatus === "error" && <div className="apply-status error">Error updating prompts. Please try again.</div>}
      </div>
    </div>
  );
}

export default PromptEditPanel;
