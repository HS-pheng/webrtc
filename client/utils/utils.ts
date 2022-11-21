import { Consumer } from 'mediasoup-client/lib/Consumer';

export const extractTracks = (consumers: Consumer[]) =>
  consumers.map((consumer) => consumer.track);

export const calcViewlayout = (containerWidth, containerHeight, numItems) => {
  const gaps = 10;
  const itemAspect = 16 / 9;
  const maxSmallItems = 4;

  if (numItems === 1) {
    let itemWidth = containerWidth - gaps * 2;
    let itemHeight = itemWidth / itemAspect;
    if (itemHeight + gaps * 2 > containerHeight) {
      itemHeight = containerHeight - gaps * 2;
      itemWidth = itemHeight * itemAspect;
    }
    return [
      {
        width: itemWidth,
        height: itemHeight,
      },
    ];
  }

  const smallItemWidth = (containerWidth - gaps) / maxSmallItems - gaps;
  const smallItemHeight = smallItemWidth / itemAspect;

  let bigItemHeight = containerHeight - smallItemHeight - 3 * gaps;
  let bigItemWidth = bigItemHeight * itemAspect;
  if (bigItemWidth + gaps * 2 > containerWidth) {
    bigItemWidth = containerWidth - gaps * 2;
    bigItemHeight = bigItemWidth / itemAspect;
  }

  const layout = [
    { width: bigItemWidth, height: bigItemHeight },
    {
      width: smallItemWidth,
      height: smallItemHeight,
    },
  ];

  return layout;
};

export const extractItemStyle = (item) => {
  return {
    visibility: 'visible',
    width: `${item.width}px`,
    height: `${item.height}px`,
  };
};
