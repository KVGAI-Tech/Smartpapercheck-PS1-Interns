import React from 'react';
import { View, Image } from '@react-pdf/renderer';
import { tw } from './PdfStyles';

export function PdfImageRenderer({ images = [], imageStyle = {}, paperType }) {
  if (!images || images.length === 0) return null;

  const imageSize = imageStyle.size || 'large';
  const imageHeight = Number(imageStyle.height || (paperType === 'writable' ? 200 : 220));
  
  const widthMap = { medium: '50%', large: '75%', full: '100%' };
  const alignMap = { left: 'flex-start', center: 'center', right: 'flex-end' };

  return (
    <View style={[tw('mt-4 w-full flex flex-col gap-2'), { alignItems: alignMap[imageStyle.align || 'center'] }]} wrap={false}>
      {images.map((asset, imgIdx) => {
        if (!asset.url) return null;
        return (
          <View key={asset.id || imgIdx} style={[{ width: widthMap[imageSize] }, tw('border border-slate-200 p-1 rounded-lg')]}>
             <Image src={asset.url} style={{ maxHeight: imageHeight, objectFit: 'contain' }} />
          </View>
        );
      })}
    </View>
  );
}
