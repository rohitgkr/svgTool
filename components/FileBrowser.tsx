// TypeScript: FileBrowser.tsx

import React, { useState } from 'react';

const FileBrowser: React.FC = () => {
  const [svgContent, setSvgContent] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSvgContent(e.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      alert('Please select an SVG file.');
    }
  };

  // This alternative implementation reads SVG as DOM instead of as a string & extracts PATH child elements
  // from the file browser (note this is on the client side, file is not uploaded to server via input form element) 
  const handleFileChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target as HTMLInputElement;
    const svgElement = document.getElementById('svg-canvas') as HTMLElement;
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
  
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const svgContent = e.target?.result;
        if (typeof svgContent === 'string') {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
            const path = svgDoc.getElementById('p_id') as unknown as SVGPathElement;
            //setSvgContent([path.id, path.getAttribute('d')??'']);
            if(path) {
                const clonedPath = path.cloneNode(true) as SVGPathElement;  
                clonedPath.id = "cloned_pid";
                clonedPath.setAttribute('stroke', 'blue');    
                // Apply a scale transform of 2
                clonedPath.setAttribute('transform', 'scale(2)');

                svgElement.appendChild(path);
                svgElement.appendChild(clonedPath);
            }
        }
      };  
      // Read the SVG file as text
      reader.readAsText(fileInput.files[0]);
    }
  };

  return (
    <div>
       <label htmlFor="file-input">Select SVG File:</label>
      <input id="file-input" type="file" accept=".svg" onChange={handleFileChange} />
      <div dangerouslySetInnerHTML={{ __html: svgContent }} />
    </div>
  );
};

export default FileBrowser;
