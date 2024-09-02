import React from "react";
import { useState } from "react";

const Logo = "https://www.surfertoday.com/images/stories/sunrise-sunset-facts.jpg";

const FirstComponent: React.FC<{}> = () => {
    const [padding, setPadding] = useState(50);
    const [scale, setScale] = useState([1,1]);
    const [svg, setSvgContent] = useState<string>('');
    const [bbox_centre, setBboxCentre] = useState([0,0]);
    const [bBox, setBbox] = useState({ x: 0, y: 0, width: 0, height: 0 });

    const handleSvgLoad = () => {
        const svgElement = document.getElementById('svg-canvas') as unknown as SVGElement;
        const path = svgElement.querySelector('#p_id') as SVGPathElement;
        if(path) {
            let bb = path.getBBox();
            setBbox(
            {
                x: bb.x,
                y: bb.y,
                width: bb.width,
                height: bb.height
            }
            );
            setBboxCentre([bb.x+(bb.width)/2, bb.y+(bb.height)/2]);
            var x_scale = (bb.width+2*padding)/bb.width
            var y_scale = (bb.height+2*padding)/bb.height
            setScale([x_scale, y_scale]);
            
            console.log(`padding: ${padding}`);
            console.log(`scale: ${scale}`);
            console.log(`bbox centre: (${bbox_centre[0]}, ${bbox_centre[1]})`);        
            console.log(`bbox width: ${bBox.width}, bbox height: ${bBox.height}, bbox left: ${bBox.x}, bbox top: ${bBox.y}`);
            console.log(`SVG content => ${svg}`);
            //setSvgContent([path.id, path.getAttribute('d')??'']);
        
            const clonedPath = path.cloneNode(true) as SVGPathElement;  
            clonedPath.id = "cloned_pid";
            clonedPath.setAttribute('stroke', 'blue');   
            clonedPath.setAttribute('stroke-width', '2'); 
            // Apply a scale transform 
            clonedPath.setAttribute('transform', `scale(${scale[0]}, ${scale[1]})`);
            clonedPath.setAttribute('transform-origin', `${bbox_centre[0]} ${bbox_centre[1]}`);
            clonedPath.setAttribute('vector-effect', 'non-scaling-stroke');;

            //svgElement.appendChild(path);
            svgElement.appendChild(clonedPath);
        } 
        else {
            console.error(`SVGPathElement with the specified ID 'p_id' not found.`);
        }
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileInput = event.target as HTMLInputElement;
        
        if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
    
        reader.onload = (e: ProgressEvent<FileReader>) => {
            const svgContent = e.target!.result;            
            if (typeof svgContent === 'string') {  
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
                const svgElement = document.getElementById('svg-canvas') as HTMLElement;
                svgElement.innerHTML = svgDoc.documentElement.innerHTML;
                setSvgContent(svgContent);
            }
        };
        // Read the SVG file as text
        reader.readAsText(fileInput.files[0]);
        }
  };


  return (
    <div>
      <h3>Browse for an SVGfile on your local system.</h3>
      <label htmlFor="file-input">Select SVG File:</label>
      <input type="file" id="file-input" accept=".svg" onChange={handleFileChange} />
      <svg id="svg-canvas" width="250" height="200" viewBox={`${-1*bbox_centre[0]} ${-2*bbox_centre[1]} 250 200`} onChange={handleSvgLoad} onLoad={handleSvgLoad} />
      <div>
        <img height="250" src={Logo} alt="Logo" /> 
      </div>
      <p>test text.</p>
    </div>
  );
};

export default FirstComponent;