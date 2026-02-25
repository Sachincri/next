import React, { useState, useRef, useCallback, CSSProperties } from 'react';

interface SmallImageOptions {
  alt: string;
  isFluidWidth?: boolean;
  src: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
}

interface LargeImageOptions {
  src: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
  alt?: string;
}

interface EnlargedImageContainerDimensions {
  width?: number;
  height?: number;
}

interface ReactImageMagnifyProps {
  smallImage: SmallImageOptions;
  largeImage?: LargeImageOptions;
  enlargedImageContainerDimensions?: EnlargedImageContainerDimensions;
  enlargedImageContainerStyle?: CSSProperties;
  shouldUsePositiveSpaceLens?: boolean;
  className?: string;
  style?: CSSProperties;
  imageClassName?: string;
  imageStyle?: CSSProperties;
  lensStyle?: CSSProperties;
  fadeDurationInMs?: number;
  hoverDelayInMs?: number;
  hoverOffDelayInMs?: number;
}

const ReactImageMagnify: React.FC<ReactImageMagnifyProps> = ({
  smallImage,
  largeImage,
  enlargedImageContainerDimensions = { width: 810, height: 480 },
  enlargedImageContainerStyle = {},
  shouldUsePositiveSpaceLens = true,
  className = '',
  style = {},
  imageClassName = '',
  imageStyle = {},
  lensStyle = {},
  fadeDurationInMs = 0,
  hoverDelayInMs = 250,
  hoverOffDelayInMs = 0
}) => {
  const [isActive, setIsActive] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [enlargedImagePosition, setEnlargedImagePosition] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverOffTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const largeWidth = largeImage?.width || imageSize.width * 4;
  const largeHeight = largeImage?.height || imageSize.height * 4;

  const containerWidth = enlargedImageContainerDimensions.width || 810;
  const containerHeight = enlargedImageContainerDimensions.height || 480;

  // Calculate lens dimensions based on magnification ratio to ensure accurate zoom
  const ratioX = imageSize.width > 0 ? largeWidth / imageSize.width : 2;
  const ratioY = imageSize.height > 0 ? largeHeight / imageSize.height : 2;

  const lensWidth = Math.min(imageSize.width, containerWidth / ratioX) || 100;
  const lensHeight = Math.min(imageSize.height, containerHeight / ratioY) || 100;

  const handleMouseEnter = useCallback(() => {
    if (hoverOffTimeoutRef.current) {
      clearTimeout(hoverOffTimeoutRef.current);
      hoverOffTimeoutRef.current = null;
    }

    // Immediate show if desired, or keep delay
    timeoutRef.current = setTimeout(() => {
      setIsActive(true);
    }, hoverDelayInMs);
  }, [hoverDelayInMs]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Removed delay for instant removal
    setIsActive(false);
  }, []); // Removed hoverOffDelayInMs dep

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imageRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const lensX = Math.max(0, Math.min(x - lensWidth / 2, rect.width - lensWidth));
    const lensY = Math.max(0, Math.min(y - lensHeight / 2, rect.height - lensHeight));

    setLensPosition({ x: lensX, y: lensY });

    // Logic: The enlarged view shows exactly what is under the lens.
    // enlargedX = -(lensX * scale)
    const scaleX = largeWidth / rect.width;
    const scaleY = largeHeight / rect.height;

    const enlargedX = -(lensX * scaleX);
    const enlargedY = -(lensY * scaleY);

    setEnlargedImagePosition({ x: enlargedX, y: enlargedY });
  }, [largeWidth, largeHeight, lensWidth, lensHeight]);

  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      setImageSize({ width: rect.width, height: rect.height });
    }
  }, []);

  const containerStyles: CSSProperties = {
    position: 'relative',
    display: smallImage.isFluidWidth ? 'flex' : 'inline-block',
    justifyContent: 'center',
    alignItems: 'center',
    width: smallImage.isFluidWidth ? '100%' : 'auto',
    height: smallImage.isFluidWidth ? '100%' : 'auto',
    cursor: shouldUsePositiveSpaceLens ? 'crosshair' : 'zoom-in',
    ...style
  };

  const imageStyles: CSSProperties = {
    display: 'block',
    width: smallImage.isFluidWidth ? '100%' : (smallImage.width || 'auto'),
    height: smallImage.isFluidWidth ? '100%' : (smallImage.height || 'auto'),
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain' as const,
    ...imageStyle
  };

  const lensStyles: CSSProperties = {
    position: 'absolute',
    border: shouldUsePositiveSpaceLens ? 'none' : '2px solid rgba(0,0,0,0.3)',
    backgroundColor: shouldUsePositiveSpaceLens ? 'transparent' : 'rgba(255, 255, 255, 0.4)',
    width: `${lensWidth}px`,
    height: `${lensHeight}px`,
    borderRadius: shouldUsePositiveSpaceLens ? '0' : '50%',
    pointerEvents: 'none',
    opacity: isActive ? 1 : 0,
    transition: `opacity ${fadeDurationInMs}ms ease-in-out`,
    left: `${lensPosition.x}px`,
    top: `${lensPosition.y}px`,
    zIndex: 10,
    boxShadow: shouldUsePositiveSpaceLens ? 'none' : '0',
    backgroundImage: shouldUsePositiveSpaceLens ?
      "url('/texture.gif')" : 'none',
    backgroundSize: 'auto',
    backgroundRepeat: 'repeat', // Ensure texture repeats if needed
    backgroundPosition: '0 0',
    ...lensStyle
  };

  const defaultEnlargedContainerStyle: CSSProperties = {
    position: 'absolute',
    top: '0',
    left: '100%',
    borderRadius: '12px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid #e5e7eb',
  };

  const enlargedContainerStyles: CSSProperties = {
    ...defaultEnlargedContainerStyle,
    width: `${enlargedImageContainerDimensions.width || 810}px`,
    height: `${enlargedImageContainerDimensions.height || 480}px`,
    backgroundColor: '#fff',
    overflow: 'hidden',
    opacity: isActive ? 1 : 0,
    transition: `opacity ${fadeDurationInMs}ms ease-in-out`,
    pointerEvents: 'none',
    zIndex: 1000,
    ...enlargedImageContainerStyle
  };

  const enlargedImageStyles: CSSProperties = {
    position: 'absolute',
    left: `${enlargedImagePosition.x}px`,
    top: `${enlargedImagePosition.y}px`,
    width: `${largeWidth}px`,
    height: `${largeHeight}px`,
    objectFit: 'contain' as const,
    transition: 'none',
    maxWidth: 'none',
    maxHeight: 'none'
  };

  return (
    <div
      ref={containerRef}
      className={`react-image-magnify ${className}`}
      style={containerStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <img
        ref={imageRef}
        src={smallImage.src}
        srcSet={smallImage.srcSet}
        sizes={smallImage.sizes}
        alt={smallImage.alt}
        className={`react-image-magnify__image ${imageClassName}`}
        style={imageStyles}
        onLoad={handleImageLoad}
      />

      <div
        className="react-image-magnify__lens"
        style={lensStyles}
      />

      <div
        className="react-image-magnify__enlarged-image-container"
        style={enlargedContainerStyles}
      >
        <img
          src={largeImage?.src || smallImage.src}
          srcSet={largeImage?.srcSet}
          sizes={largeImage?.sizes}
          alt={largeImage?.alt || smallImage.alt}
          style={enlargedImageStyles}
        />
      </div>
    </div>
  );
};

export default ReactImageMagnify;