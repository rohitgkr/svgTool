import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid'
import "./styles.css";

const SVG_NS = 'http://www.w3.org/2000/svg';

interface StrokeAttributes {
    color: string;
    dasharray: string;
    width: number;
}

const POINTER_OVER_STROKE_ATTRIBUTES = {
    color: 'yellow', // Stroke color set to red
    dasharray: 'none', // Example dasharray
    width: 4 // Stroke width set to 2
};
const POINTER_CLICK_STROKE_ATTRIBUTES = {
    color: 'red', // Stroke color set to red
    dasharray: 'none', // Example dasharray
    width: 3 // Stroke width set to 2
};

const svg_id: string = "svg_id";

type D = Record<string, StrokeAttributes>;

type SVGComponentProps =
    {
        svgContent: string;
        imgContent: string|null;
        selectedPathAttributes: StrokeAttributes;
        selectedPath: SVGPathElement | null;
        onPathSelected: (pathElement: SVGPathElement | null) => void;
    };

const SvgComponent2: React.FC<SVGComponentProps> = ({ svgContent, imgContent, selectedPathAttributes, selectedPath, onPathSelected }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const strokeAttributesById = useRef<D>({});

    const [padding, setPadding] = useState<number>(30);
    const [border, setBorder] = useState<number>(2);
    const [paddedBbox, setPaddedBbox] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [boundary, setBoundary] = useState({ x: 0, y: 0, width: 0, height: 0 });
    //let boundary = { x: 0, y: 0, width: 0, height: 0 };
    const [rotationAngle, setRotationAngle] = useState(0);

    const [isDragging, setIsDragging] = useState(false);
    const [start, setStart] = useState({ x: 0, y: 0 });
    const [end, setEnd] = useState({ x: 0, y: 0 });

    const rectRef = useRef<SVGRectElement | null>(null);
    const imgRef = useRef<SVGImageElement | null>(null);

    console.log('SVG2 render()...');
    // Any main flow for each render cycle goes here
    const OnRender = () => {

        if (selectedPath) {
            console.log(`SVG2.render, sel: ${true}`);
            selectedPath.setAttribute('stroke-width', `${selectedPathAttributes.width}`);
            console.log(`set width:${selectedPathAttributes.width}`);
            selectedPath.setAttribute('stroke-dasharray', selectedPathAttributes.dasharray);
            console.log(`set width:${selectedPathAttributes.dasharray}`);
            selectedPath.setAttribute('stroke', selectedPathAttributes.color);
            console.log(`set width:${selectedPathAttributes.color}`);
        } else {
            console.log('SVG2.render: selectedPath is null');
        }
    }

    const RegisterPathEvents = (path: SVGPathElement) => {
        path.addEventListener('mouseenter', onHoverOverPath);
        path.addEventListener('mouseleave', onHoverOverPath);
        path.addEventListener('click', onHoverOverPath);
        console.log(`Registered event handlers on path.id: ${path.id}`);
    }
    const UnRegisterPathEvents = (svgPaths: NodeListOf<SVGPathElement>) => {
        svgPaths.forEach(path => {
            path.removeEventListener('mouseenter', onHoverOverPath);
            path.removeEventListener('mouseleave', onHoverOverPath);
            path.removeEventListener('click', onHoverOverPath);
        });
        console.log('Deregistered event handlers on all SVG Paths');
    }


    // Effect has a file dependency to update the SVG content
    useEffect(() => {
        console.log(`useEffect:SVGC2..sel: ${selectedPath !== null}`);
        if (svgRef.current && svgContent) {
            if (rectRef.current && svgRef.current.contains(rectRef.current)) { svgRef.current.removeChild(rectRef.current); rectRef.current = null; }
            svgRef.current.innerHTML = svgContent;
            console.log('set innerHTML to svgContent');
            let svgPaths: NodeListOf<SVGPathElement> = null as unknown as NodeListOf<SVGPathElement>;
            svgPaths = document.querySelectorAll('svg path');
            strokeAttributesById.current = {};
            console.log('Reset StrokeAttributesById {}');
            svgPaths.forEach(path => {
                if (!path.id)
                    path.setAttribute('id', uuidv4());
                strokeAttributesById.current[path.id] = {
                    color: path.getAttribute('stroke') ?? path.getAttribute('fill') ?? "black",
                    dasharray: path.getAttribute('stroke-dasharray') ?? "none",
                    width: parseFloat(path.getAttribute('stroke-width') ?? "1")
                };
                console.log(`StrokeAttributesById queued: ${path.id}`)
                RegisterPathEvents(path);

            });
            console.log('rebuilt strokeAttributesById dictionary');
            resizeOnLoadSVG(); // Resize the ViewBox
            return () => {
                UnRegisterPathEvents(svgPaths);
            }
        }
        if(svgRef.current && imgContent) {
            if (!imgRef.current) {
                let i = document.createElementNS(SVG_NS, 'image');
                svgRef?.current?.appendChild(i);
                imgRef.current = i;
            }
            imgRef.current.setAttributeNS(SVG_NS, 'xlink:href', imgContent);
            //imgRef.current.setAttributeNS(null, 'width', file.size); 
            //imgRef.current.setAttributeNS(null, 'height', file.size); 

            //if (rectRef.current && rectRef.current.contains(rectRef.current)) { svgRef.current.removeChild(rectRef.current); rectRef.current = null; }
        }
        console.log('useEffect.return:SVGC2..');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [svgContent, imgContent]);


    // Call from event handlers or effects. This will schedule a re-render to reflect changes to viewbox dimensions made in event handlers or effects & hence will show up on re-render 
    const resizeOnLoadSVG = () => {
        console.log('resizeOnLoadSVG..')
        const svgContainer = svgRef.current;
        if (svgContainer) {
            setPaddedBbox({
                x: svgContainer.getBBox().x,
                y: svgContainer.getBBox().y,
                width: svgContainer.getBBox().width,
                height: svgContainer.getBBox().height
            });
        }
    };


    const onHoverOverPath = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target) {
            const s = e.target instanceof SVGPathElement ? e.target as SVGPathElement : null;
            if (s) {
                switch (e.type) {
                    case 'mouseenter':
                        console.log(`mouse enter, sel: ${selectedPath !== null} `)
                        onPointerEnter(s);
                        break;
                    case 'mouseleave':
                        console.log(`mouse leave, sel: ${selectedPath !== null} `)
                        onPointerLeave(s);
                        break;
                    case 'click':
                        console.log(`mouse click, sel: ${selectedPath !== null} `)
                        onPathSelection(s);
                        selectedPath = selectedPath === null ? s : null;
                        onPathSelected(selectedPath);
                        break;
                }
            }
        }
    }


    const setOrResetStrokeAttributes = (
        svgElement: SVGPathElement,
        attributes: StrokeAttributes | null, // pass NULL when shouldSet = false to reset to previous stroke 
        shouldSet: boolean
    ) => {

        const id = svgElement.id!;
        const currentAttributes = strokeAttributesById.current[id];
        console.log(`Cached Stroke id: ${id} -> color:${currentAttributes?.color}`);
        if (!currentAttributes) { // id not previously stored
            strokeAttributesById.current[id] = {
                color: svgElement.getAttribute('stroke') ?? '',
                dasharray: svgElement.getAttribute('stroke-dasharray') ?? 'none',
                width: parseFloat(svgElement.getAttribute('stroke-width') ?? '1'),
            };
        }

        if (shouldSet) {
            // Set the stroke attributes from the parameters
            svgElement.setAttribute('stroke', attributes!.color);
            svgElement.setAttribute('stroke-dasharray', attributes!.dasharray);
            svgElement.setAttribute('stroke-width', attributes!.width.toString());
        } else if (attributes) {
            // Reset the stroke attributes from the useState variable
            svgElement.setAttribute('stroke', attributes.color);
            svgElement.setAttribute('stroke-dasharray', attributes.dasharray);
            svgElement.setAttribute('stroke-width', attributes.width.toString());
        } else if (currentAttributes) {
            // Reset the stroke attributes from the useState variable
            svgElement.setAttribute('stroke', currentAttributes.color);
            svgElement.setAttribute('stroke-dasharray', currentAttributes.dasharray);
            svgElement.setAttribute('stroke-width', currentAttributes.width.toString());
        }
    };

    const onPointerEnter = (pathElement: SVGPathElement) => {
        console.log(`mouse enter- sel: ${selectedPath !== null}`);
        if (pathElement) {
            if (selectedPath !== null) return; // clickedpaths must be reset only by clicking 
            let wasHighlighted: boolean = (pathElement.getAttribute('stroke') ?? '') === 'yellow' ? true : false;
            setOrResetStrokeAttributes(pathElement, POINTER_OVER_STROKE_ATTRIBUTES, !wasHighlighted);
        }
    }

    const onPointerLeave = (pathElement: SVGPathElement) => {
        console.log(`mouse leave- sel: ${selectedPath !== null}`);
        if (pathElement) {
            if (selectedPath !== null) return; // clickedpaths must be reset only by clicking 
            setOrResetStrokeAttributes(pathElement, null, false);
        }
    }

    const onPathSelection = (pathElement: SVGPathElement) => {
        console.log(`mouse click- sel: ${selectedPath !== null}`);
        let wasClicked: boolean = selectedPath !== null;
        // reset on click toggle to pointer over color
        setOrResetStrokeAttributes(pathElement, wasClicked ? null : POINTER_CLICK_STROKE_ATTRIBUTES, !wasClicked);
        if (pathElement) {
            let bbox = pathElement.getBBox();
            const Cx = bbox.x + (bbox.width) / 2;
            const Cy = bbox.y + (bbox.height) / 2;

            const x_scale = (bbox.width + 2 * padding) / bbox.width
            const y_scale = (bbox.height + 2 * padding) / bbox.height
            const scale = [x_scale, y_scale];

            console.log(`padding: ${padding}`);
            console.log(`scale: ${scale}`);
            console.log(`bbox centre: (${Cx}, ${Cy})`);
            console.log(`bbox width: ${bbox.width}, bbox height: ${bbox.height}, bbox left: ${bbox.x}, bbox top: ${bbox.y}`);
            console.log(`Cl_rect_box width: ${pathElement.getBoundingClientRect().width}, Cl_rect_box height: ${pathElement.getBoundingClientRect().height}, Cl_rect_box left: ${pathElement.getBoundingClientRect().x}, Cl_rect_box top: ${pathElement.getBoundingClientRect().y}`);
            console.log(`Vbox width: ${svgRef.current?.viewBox.baseVal.width}, Vbox height: ${svgRef.current?.viewBox.baseVal.height}, Vbox left: ${svgRef.current?.viewBox.baseVal.x}, Vbox top: ${svgRef.current?.viewBox.baseVal.y}`);

            bbox = pathElement.getBBox();
            setPaddedBbox({
                x: bbox.x,
                y: bbox.y,
                width: bbox.width,
                height: bbox.height
            });
            console.log(`set clk bbox width: ${bbox.width}, bbox height: ${bbox.height}, bbox left: ${bbox.x}, bbox top: ${bbox.y}`);
            // Allow a path to be clicked only once to create an outline clone of that path. 
            //pathElement.removeEventListener('click', onHoverOverPath);
            // for now allow re-clicking the same element
        }
    };

    const resolveMouseEventRelativeToViewBox2 = (e: React.MouseEvent): { x: number, y: number } => {
        //return [e.clientX - e.currentTarget.getBoundingClientRect().left, e.clientY - e.currentTarget.getBoundingClientRect().top];
        const svgRect = e.currentTarget.getBoundingClientRect();
        let viewBox = svgRef.current?.viewBox.baseVal;
        const scaleX = (viewBox?.width === 0 || !viewBox?.width) ? 1 : (viewBox?.width / svgRect.width);
        const scaleY = (viewBox?.height === 0 || !viewBox?.height) ? 1 : (viewBox?.height / svgRect.height);
        const offsetX = (e.clientX - svgRect.left - 4 * (padding + border)) * scaleX;
        const offsetY = (e.clientY - svgRect.top - 4 * (padding + border)) * scaleY;
        return { x: offsetX, y: offsetY };
    }

    const resolveMouseEventRelativeToViewBox = (e: React.MouseEvent): { x: number, y: number } => {
        //return [e.clientX - e.currentTarget.getBoundingClientRect().left, e.clientY - e.currentTarget.getBoundingClientRect().top];
        let ctm = svgRef.current?.getScreenCTM();
        const offsetX = (e.clientX - (ctm?.e ?? 0)) / (ctm?.a ?? 1);
        const offsetY = (e.clientY - (ctm?.f ?? 0)) / (ctm?.d ?? 1);
        return { x: offsetX, y: offsetY };
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        // Start drawing the boundary rectangle
        setIsDragging(true);
        const p = resolveMouseEventRelativeToViewBox(e);
        setStart(p);
        setEnd(p);
        console.log(`Started:${isDragging}: offset:(${p.x},${p.y}) start:(${start.x},${start.y})`);
        if (!rectRef.current) {
            let r = document.createElementNS(SVG_NS, 'rect');
            svgRef?.current?.appendChild(r);
            rectRef.current = r;
        }
        rectRef.current.setAttribute('x', `${p.x}`);
        rectRef.current.setAttribute('y', `${p.y}`);
        rectRef.current.setAttribute('width', '0');
        rectRef.current.setAttribute('height', '0');
        rectRef.current.setAttribute('stroke', 'red');
        rectRef.current.setAttribute('fill', 'none');        
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            const p = resolveMouseEventRelativeToViewBox(e);
            setEnd(p);
            console.log(`drag:${isDragging}: size:(${Math.abs(p.x - start.x)},${Math.abs(p.y - start.y)}), start:(${start.x},${start.y}), offset:(${end.x},${end.y})`);
            if (rectRef.current) {
                rectRef.current.setAttribute('width', `${Math.abs(p.x - start.x)}`);
                rectRef.current.setAttribute('height', `${Math.abs(p.y - start.y)}`);
            }
        }
    }


    const handleMouseUp = () => {
        setIsDragging(false);
        setBoundary({ x: start.x, y: start.y, width: end.x - start.x, height: end.y - start.y });
        console.log(`End:${isDragging}: (${end.x},${end.y}) boundary: ${boundary.x},${boundary.y},${boundary.width},${boundary.height}`);

    };

    /*
     * Main functional component flow
     */
    OnRender();

    console.log('SVG2 render().return...');
    return (
        <div className='flex-container' >

            <svg ref={svgRef} id={svg_id}
                viewBox={`${paddedBbox.x - padding - border} ${paddedBbox.y - padding - border} ${paddedBbox.width + 2 * (border + padding)} ${paddedBbox.height + 2 * (border + padding)}`}
                style={{ backgroundColor: 'white' }}
                pointerEvents="visibleStroke"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                {/* Render the boundary rectangle */}
                
                
            </svg>
        </div>

    );
};


export default SvgComponent2;
