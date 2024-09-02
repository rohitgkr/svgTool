
// Defines the StringDelegate with SVG content as parameter 
export type FileContentDelegate = (svgContent: string, svgFileName: string) => void;

export type SVGProps = {
  onFileChange: FileContentDelegate;
  onImageChange: FileContentDelegate;
};


