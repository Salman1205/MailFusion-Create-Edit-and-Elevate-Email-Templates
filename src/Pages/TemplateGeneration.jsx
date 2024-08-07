import React, { useState, useRef } from 'react';
import dummy from "../Media/dummy.png";
import Template1 from '../Components/Template1.jsx';
import Template2 from '../Components/Template2.jsx';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../Css/profile.css";

const TemplateGeneration = ({
    menuVisible, 
    setMenuVisible,
    emplateForEditor, 
    setTemplateForEditor,
    loginCredentials
}) => {

    const navigate = useNavigate();

    const [formFeedback, setFormFeedback] = useState(false);
    const [logoPreview, setLogoPreview] = useState(dummy);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [isTemplate1, setIsTemplate1] = useState(true);
    const [selectedLogo, setSelectedLogo] = useState(dummy);

    const promptRef = useRef(null);


    const handleSubmit = (event) => {
        event.preventDefault();
        setFormFeedback(true);
        setTimeout(() => {
            setFormFeedback(false);
        }, 3000);
    };

    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
    };

    const handleLogoChange = (event) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setLogoPreview(e.target.result);
            setSelectedLogo(e.target.result);
        };
        reader.readAsDataURL(event.target.files[0]);
    };

    const handleCopyToClipboard = (id) => {
        const templateElement = document.getElementById(id);
        const range = document.createRange();
        range.selectNode(templateElement);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand("copy");
        window.getSelection().removeAllRanges();
        alert("Template copied to clipboard!");
    };

    const extractHtml = (templateId) => {
        const element = document.getElementById(templateId);
        if (element) {
        const htmlWithInlineStyles = element.outerHTML;
        return htmlWithInlineStyles;
        } else {
        console.error(`Element with ID ${templateId} not found.`);
        return null;
        }
    }

    const sendToEditor = (templateId) => {

        const extractedHtml = extractHtml(templateId);
        console.log(extractedHtml);
    
        setTemplateForEditor(prev => {
            let current = prev;
            current.body.rows[0].columns[0].contents[0].values.text = extractedHtml;
            return prev;
        });
    
        navigate("/profile/template-editor");
    };

    const handlePromptSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        const prompt = promptRef.current.value;
        try {
            const response = await fetch(`${process.env.REACT_APP_QUERY_URL}/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: prompt }),
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        setLoading(false);
    };

    const saveToDatabase = async (templateId) => {
    
        console.log(loginCredentials)
    
        const extractedHtml = extractHtml(templateId);
        if (extractedHtml === null) {
        return;
        }
    
        try {
        const response = await fetch(`${process.env.REACT_APP_LOGIN_SIGNUP_URL}/template`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: loginCredentials.user_id,
                template: extractedHtml,
            }),
        });
    
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error: ${response.status} ${response.statusText} - ${errorText}`);
        }
    
        const data = await response.json();
        
        alert('Successfully added template:', data);
    
        navigate('/profile');
        } catch (error) {

            alert('Error:', error);
        }
    }

    const toggleTemplate = () => {
        setIsTemplate1(!isTemplate1);
    };

    return (
        <>
            <div className={`profile_page-main-content ${menuVisible ? 'menu-visible' : ''}`}>
                <button className="profile_page-menu-toggle-outer" onClick={toggleMenu}>
                    <i className="fa-solid fa-bars"></i>
                </button>
                <h1 style={{ marginLeft: "0.5rem" }}>Template Generation</h1>
                <form id="brand-kit-form" onSubmit={handleSubmit}>
                    <div className="profile_page-form-section">
                        <label htmlFor="logo"><h5>Logo</h5></label>
                        <img src={logoPreview} alt="Logo Preview" id="logo-preview" />
                        <input type="file" id="logo" name="logo" accept="image/*" onChange={handleLogoChange} />
                    </div>
                </form>
                <div className="social-links-section">
                    <h2>Social Links</h2>
                    <div className="form-group">
                        <label htmlFor="website">Website</label>
                        <input type="text" id="website" placeholder="Enter your website URL" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="instagram">Instagram</label>
                        <input type="text" id="instagram" placeholder="Enter your Instagram URL" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="twitter">Twitter</label>
                        <input type="text" id="twitter" placeholder="Enter your Twitter URL" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="facebook">Facebook</label>
                        <input type="text" id="facebook" placeholder="Enter your Facebook URL" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="linkedin">LinkedIn</label>
                        <input type="text" id="linkedin" placeholder="Enter your LinkedIn URL" />
                    </div>
                </div>

            </div>
            <div className={`profile_page-additional-content ${menuVisible ? 'menu-visible' : ''}`}>
                <h1 style={{ textAlign: "center" }}>Template Result</h1>
                <div className="profile_page-result">
                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center w-100">
                            <div className="spinner-grow text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : result ? (
                        <div className="template-container">
                            <button className="copy-button" onClick={() => handleCopyToClipboard('template1')}>
                                <i className="fa-solid fa-clipboard"></i>
                            </button>
                            <button className="edit-button" onClick={() => sendToEditor("template1")}>
                                <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <i
                                className={`fa-solid fa-arrow-right toggle-template ${isTemplate1 ? 'rotate-right' : 'rotate-left'}`}
                                onClick={toggleTemplate}
                                aria-label="Toggle Template"
                            ></i>
                            <div id="template1">
                                {isTemplate1 ? 
                                (
                                    <div id="template1">
                                        <Template1 result={result} logo={selectedLogo} />
                                    </div>
                                ) : (
                                    <div id="template2">
                                        <Template2 result={result} logo={selectedLogo} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p>No result to display</p>
                    )}
                </div>
            </div>
            <div className={`prompt-section ${menuVisible ? 'slide-right' : ''}`}>
                <form id="prompt-form" onSubmit={handlePromptSubmit} className="profile_page-form-with-icon">
                    <div className="prompt-area">
                        <div className="textarea-container">
                            <textarea id="prompt" ref={promptRef} placeholder="Describe the email you'd like to create" />
                            <button type="submit" className="profile_page-submit-icon" disabled={loading}>
                                <i className="fa-solid fa-magnifying-glass"></i>
                            </button>
                        </div>
                    </div>
                    <div id="form-feedback" className={formFeedback ? '' : 'profile_page-hidden'}>Submitted successfully!</div>
                </form>
            </div>
        </>
    )
}

export default TemplateGeneration;