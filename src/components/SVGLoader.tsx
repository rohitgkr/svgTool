import { Flex } from 'antd'
import { SVGProps } from './SVGDelegate';


const SVGLoader: React.FC<SVGProps> = ({ onFileChange, onImageChange }) => {
  
  /*  Read file using FileReader with async/await
      Return the InnerHTML inside <svg></svg> tags
  */
  const readFileAsync = (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const parser = new DOMParser();
        let svgDoc = parser.parseFromString(e.target?.result as string, 'image/svg+xml');
        resolve(svgDoc.documentElement.innerHTML);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const readImageAsync = (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'image/svg+xml') {
      try {
        const text = await readFileAsync(file);
        onFileChange(text, file?.name ?? "");
        console.log(`handleFileChange: file:${file.name} len: ${text.length}`);
      } catch (error) {
        console.error('Error reading file:', error);
      }
    } else {
      alert('Please select an SVG file.');
    }
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && /\.(jpg|jpeg|png|gif)$/i.test(file.name.toLowerCase())) {
      try {
        const text = await readImageAsync(file);
        onImageChange(text, file?.name ?? "");
        console.log(`handleImageChange: file:${file.name} len: ${text.length}`);
      } catch (error) {
        console.error('Error reading file:', error);
      }
    } else {
      alert('Please select an Image file (jpg, jpeg, png, gif).');
    }
  };

  
 
  return (
    <>
      <Flex gap="middle" justify='center' vertical={false}>
        <label htmlFor="file-input">Select SVG File:</label>
        <input id="file-input" type="file" accept=".svg" onChange={handleFileChange} />

        <label htmlFor="img-input">Select background image:</label>
        <input id="img-input" type="file" accept=".jpg,.png" onChange={handleImageChange} />
      </Flex>
    </>
  );
};

export default SVGLoader;
