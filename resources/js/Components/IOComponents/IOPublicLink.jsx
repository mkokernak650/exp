import { useEffect, useRef, useState } from "react";

export default function IOPublicLink({ link }) {
    const [copied, setCopied] = useState(false)
    const timer = useRef(null)

    const unsecuredCopyToClipboard = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Unable to copy to clipboard', err);
        }
        document.body.removeChild(textArea);
    }

    const copyToClipboard = (link) => {
        if (window.isSecureContext && navigator.clipboard) {
            navigator.clipboard.writeText(link);
            setCopiedAndReset()
        } else {
            unsecuredCopyToClipboard(link);
            setCopiedAndReset()
        }
    }

    const setCopiedAndReset = () => {
        setCopied(true)
        timer.current = setTimeout(() => {
            setCopied(false)
            clearTimeout(timer.current)
        }, 3000)
    }

    useEffect(() => {
        return () => {
            clearTimeout(timer.current);
        }
    }, [])

    return (
        <div className="io-public-link">
            {!copied ?
                <button className="copy" onClick={() => copyToClipboard(link)}>Copy</button> :
                <div className="copied">Copied</div>
            }
            <a href={link} target="_blank" className="view">View</a>
        </div>
    )
}