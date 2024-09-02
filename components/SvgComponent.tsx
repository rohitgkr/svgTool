import { getuid } from 'process';
import React, { useState, useEffect } from 'react';

interface StrokeAttributes {
    color: string;
    dasharray: string;
    width: string;
}
const POINTER_OVER_STROKE_ATTRIBUTES = {
    color: 'yellow', // Stroke color set to red
    dasharray: 'none', // Example dasharray
    width: '4' // Stroke width set to 2
};
const POINTER_CLICK_STROKE_ATTRIBUTES = {
    color: 'red', // Stroke color set to red
    dasharray: 'none', // Example dasharray
    width: '3' // Stroke width set to 2
};

const useStrokeAttributes = () => {
    const [strokeAttributesById, setStrokeAttributesById] = useState<{ [id: string]: StrokeAttributes }>({});
  
    const setOrResetStrokeAttributes = (
      svgElement: SVGPathElement,
      attributes: StrokeAttributes | null, // pass NULL when shouldSet = false to reset to previous stroke 
      shouldSet: boolean
    ) => {
      const id = svgElement.id;
      const currentAttributes = strokeAttributesById[id];
  
      if (!currentAttributes) { // id not previously stored
        // Store the SVGElement's current stroke attributes if not already stored
        setStrokeAttributesById({
          ...strokeAttributesById,
          [id]: {
            color: svgElement.getAttribute('stroke') || '',
            dasharray: svgElement.getAttribute('stroke-dasharray') || '',
            width: svgElement.getAttribute('stroke-width') || '',
          },
        });
      }
  
      if (shouldSet) {
        // Set the stroke attributes from the parameters
        svgElement.setAttribute('stroke', attributes!.color);
        svgElement.setAttribute('stroke-dasharray', attributes!.dasharray);
        svgElement.setAttribute('stroke-width', attributes!.width);
      } else if (currentAttributes) {
        // Reset the stroke attributes from the useState variable
        svgElement.setAttribute('stroke', currentAttributes.color);
        svgElement.setAttribute('stroke-dasharray', currentAttributes.dasharray);
        svgElement.setAttribute('stroke-width', currentAttributes.width);
      }
    };
  
    return { setOrResetStrokeAttributes };
  };
  

const SvgComponent: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [padding, setPadding] = useState<number>(50);
    const [border, setBorder] = useState<number>(2);
    const [paddedBbox, setPaddedBbox] = useState({ x: 0, y: 0, width: 0, height: 0 });

    const { setOrResetStrokeAttributes } = useStrokeAttributes();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            console.log(`Set file to: ${file.name}`);
        }
    };

    const onHoverOverPath = (e: PointerEvent) => {        
        //e.target.style.stroke = 'rgb(158,239,36)';
        const target = e.target as HTMLElement;
        if(target) {
            console.log(`Evt type:${e.type}, target id:${target.id} target type:${target.nodeType} stroke:${target.style.stroke} stroke-attribute:${target.getAttribute('stroke')}`);
            const s = e.target as SVGPathElement;
            if(s) {
                console.log(`SVG path stroke: ${s.getAttribute('stroke')}`);
                const id: string = s.id ?? getuid().toString();
                let flag:boolean = (e.type === 'pointerenter' || e.type === 'pointerover') ? true : false;
                if(flag) setOrResetStrokeAttributes(s, POINTER_OVER_STROKE_ATTRIBUTES, flag); else setOrResetStrokeAttributes(s, null, flag)
            }
            //target.style.stroke = 'rgb(255,0,0)'
            target.setAttribute('stroke', 'rgb(255,0,0)')
        }
    }



    const onPathSelection = (pathElement: SVGPathElement) => {
        //const pathElement = svgContainer.querySelector('#p_id') as SVGPathElement;
        if (pathElement) {
            const svgContainer = document.getElementById('svg_id') as HTMLElement; 
            
            const bbox = pathElement.getBBox();
            setPaddedBbox({
                x: bbox.x - padding,
                y: bbox.y - padding,
                width: bbox.width + padding * 2,
                height: bbox.height + padding * 2,
            });
            const Cx = bbox.x + (bbox.width) / 2;
            const Cy = bbox.y + (bbox.height) / 2;

            const x_scale = (bbox.width + 2 * padding) / bbox.width
            const y_scale = (bbox.height + 2 * padding) / bbox.height
            const scale = [x_scale, y_scale];

            console.log(`padding: ${padding}`);
            console.log(`scale: ${scale}`);
            console.log(`bbox centre: (${Cx}, ${Cy})`);
            console.log(`bbox width: ${bbox.width}, bbox height: ${bbox.height}, bbox left: ${bbox.x}, bbox top: ${bbox.y}`);
            console.log(`PADDED bbox width: ${paddedBbox.width}, bbox height: ${paddedBbox.height}, bbox left: ${paddedBbox.x}, bbox top: ${paddedBbox.y}`);
            console.log(`SVG file => ${selectedFile}`);

            const clonePath = pathElement.cloneNode(true) as SVGPathElement;
            clonePath.id = 'p_id_clone';
            clonePath.setAttribute('stroke', 'gray');
            clonePath.setAttribute('stroke-width', '2');
            clonePath.setAttribute('transform', `scale(${scale[0]}, ${scale[1]})`);
            clonePath.setAttribute('transform-origin', `${Cx} ${Cy}`);
            clonePath.setAttribute('vector-effect', 'non-scaling-stroke');;
            clonePath.setAttribute('stroke-dasharray', '5,5')
            svgContainer.appendChild(clonePath);
        }
    };

    useEffect(() => {
        if (selectedFile) {
            window.addEventListener('pointerover', onHoverOverPath);
            window.addEventListener('pointerenter', onHoverOverPath);
            window.addEventListener('pointerleave', onHoverOverPath);

            const reader = new FileReader();
            reader.onload = (e) => {
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(e.target?.result as string, 'image/svg+xml');
                const innerSvgContent = svgDoc.documentElement.innerHTML;
                const svgContainer = document.getElementById('svg_id') as HTMLElement;
                svgContainer.innerHTML = innerSvgContent;

                /*
                const svgElement = svgDoc.documentElement;
                // Ensure the SVG element is fully loaded before attaching event listeners
                svgElement.onload = () => {
                    svgElement.addEventListener('mousedown', (event: MouseEvent) => {
                    if (event.button === 0) { 
                        const target = event.target as SVGPathElement;
                        if (target.nodeName === 'path') {
                        console.log('Mouse down on path segment:', target);
                        // Handle the mouse down event
                        // You can now work with 'target' which is the path element
                        }
                    }});
                    // Append the SVG to the DOM
                    document.body.appendChild(svgElement);
                };

                // If the SVG does not have an 'onload' event, append it directly
                if (!svgElement.onload) {
                document.body.appendChild(svgElement);
                svgElement.dispatchEvent(new Event('load'));
                } */
            };
            reader.readAsText(selectedFile);

            return () => { 
                window.removeEventListener('pointerover', onHoverOverPath);
                window.removeEventListener('pointerenter', onHoverOverPath);
                window.removeEventListener('pointerleave', onHoverOverPath);
            }
        }
    }, [selectedFile, padding]);

    return (
        <div>
            <label htmlFor="file-input">Select SVG File:</label>
            <input id="file-input" type="file" accept=".svg" onChange={handleFileChange} />
            <svg id="svg_id" viewBox={`${-padding - border} ${-padding - border} ${paddedBbox.width + 2 * border} ${paddedBbox.height + 2 * border}`} style={{ backgroundColor: 'white' }} pointerEvents="visibleStroke"></svg>
        </div>
    );
};

export default SvgComponent;
