type ImageSlotProps = {
  /** Path under /public once you add the asset, e.g. /landing/hero.png */
  src?: string
  alt?: string
  className?: string
  /** Hint shown while the slot is empty */
  label?: string
}

/**
 * Reserved media area for landing visuals.
 * Pass `src` (file in public/) when assets are ready; until then the slot stays blank.
 */
export default function ImageSlot({ src, alt = '', className = '', label }: ImageSlotProps) {
  if (src) {
    return (
      <div className={`lp-image-slot ${className}`.trim()}>
        <img
          src={src}
          alt={alt}
          className="lp-image-slot__img"
          loading="lazy"
          onError={(event) => {
            console.error('Failed to load landing image:', src)
            event.currentTarget.style.display = 'none'
          }}
        />
      </div>
    )
  }

  return (
    <div
      className={`lp-image-slot lp-image-slot--empty ${className}`.trim()}
      aria-label={label ? `Image placeholder: ${label}` : 'Image placeholder'}
      role="img"
    />
  )
}
