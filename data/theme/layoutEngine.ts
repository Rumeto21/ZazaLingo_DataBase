/**
 * BoundingBox (Sınır Kutusu) Arabirimi
 * Ekranda çizilecek olan UI öğelerinin mutlak piksel konumu.
 */
export interface BoundingBox {
    id: string;
    cx: number;       // Merkez X Koordinatı
    cy: number;       // Merkez Y Koordinatı
    width: number;
    height: number;
    left: number;
    right: number;
    top: number;
    bottom: number;
}

/**
 * ResolverConfig (Yerleşim Ayarları)
 */
export interface ResolverConfig {
    screenWidth: number;
    screenHeight: number;
    // responsiveCalculator.ts'den dönen JSON verisi
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ratios: Record<string, any>;
    activeElementIds: string[];
    /** Dışarıdan önceden hesaplanmış sabit kutular (maskot dışı elementler) */
    precomputedBoxes?: BoundingBox[];
}

/**
 * İki kutu arasında çakışma (AABB Collision) kontrolü yapar.
 * @param box1 Birinci kutu
 * @param box2 İkinci kutu 
 * @param minGap Zorunlu olan en az piksel boşluğu (Varsayılan: 1px)
 */
export function checkCollision(box1: BoundingBox, box2: BoundingBox, minGap: number = 1): boolean {
    return (
        box1.left - minGap < box2.right &&
        box1.right + minGap > box2.left &&
        box1.top - minGap < box2.bottom &&
        box1.bottom + minGap > box2.top
    );
}

/**
 * Ekran yerleşimi hesaplayıcı motor. Sırasıyla tüm UI öğelerini çizer,
 * Maskotları çakışmayacak şekilde optimum (Aspect Ratio tutarak) küçültüp sahneye bırakır.
 */
export function resolveLayout(config: ResolverConfig): Record<string, BoundingBox> {
    const { screenWidth, screenHeight, ratios, activeElementIds, precomputedBoxes } = config;
    
    const results: Record<string, BoundingBox> = {};
    // Dışarıdan verilen sabit kutularla collision listesini başlat
    const collisionObjects: BoundingBox[] = precomputedBoxes ? [...precomputedBoxes] : [];
    
    // -------------------------------------------------------------
    // ADIM 1: Maskot harici tüm öğelerin (buton, başlık vb.) kutularını hesapla
    // -------------------------------------------------------------
    activeElementIds.forEach(id => {
        if (id.includes('mascot')) return;
        
        const objRatio = ratios[id];
        if (!objRatio) return;
        
        let cx = screenWidth / 2; // Varsayılan merkez X
        let cy = screenHeight / 2; // Varsayılan merkez Y
        let width = 0;
        let height = 0;
        
        const keys = Object.keys(objRatio);
        
        // Yatay Merkez Bulma
        const xKey = keys.find(k => objRatio[k].axis === 'X');
        if (xKey) cx = screenWidth * (objRatio[xKey].absoluteRatio ?? 0.5);
        
        // Dikey Merkez Bulma
        const yKey = keys.find(k => objRatio[k].axis === 'Y');
        if (yKey) cy = screenHeight * (objRatio[yKey].absoluteRatio ?? 0.5);
        
        // Genişlik
        const wKey = keys.find(k => objRatio[k].axis === 'W');
        if (wKey) {
            const wData = objRatio[wKey];
            width = wData.isPercentage ? screenWidth * (wData.ratio ?? 1) : screenWidth * (wData.ratio ?? 1);
        }
        
        // Yükseklik
        const hKey = keys.find(k => objRatio[k].axis === 'H');
        if (hKey) {
            height = screenHeight * (objRatio[hKey].ratio ?? 1);
        }
        
        const box: BoundingBox = {
            id, cx, cy, width, height,
            left: cx - width / 2,
            right: cx + width / 2,
            top: cy - height / 2,
            bottom: cy + height / 2
        };
        
        results[id] = box;
        collisionObjects.push(box);
    });
    
    // -------------------------------------------------------------
    // ADIM 2: Maskotları Hesapla ve Çakışmaya Göre Oransal Daralt
    // -------------------------------------------------------------
    const mascotIds = activeElementIds.filter(id => id.includes('mascot'));
    
    mascotIds.forEach(mId => {
        const objRatio = ratios[mId];
        if (!objRatio) return;
        
        let cx = screenWidth / 2;
        let cy = screenHeight / 2;
        let width = 0;
        let height = 0;
        
        const keys = Object.keys(objRatio);
        
        const xKey = keys.find(k => objRatio[k].axis === 'X');
        if (xKey) cx = screenWidth * (objRatio[xKey].absoluteRatio ?? 0.5);
        
        const yKey = keys.find(k => objRatio[k].axis === 'Y');
        if (yKey) cy = screenHeight * (objRatio[yKey].absoluteRatio ?? 0.5);
        
        const wKey = keys.find(k => objRatio[k].axis === 'W');
        if (wKey) {
             width = screenWidth * (objRatio[wKey].ratio ?? 0.3);
        }
        
        const hKey = keys.find(k => objRatio[k].axis === 'H');
        if (hKey) {
             height = screenHeight * (objRatio[hKey].ratio ?? 0);
        } else {
             // Maskotlarda yükseklik verisi yoksa oransal sabiti vardır: Height = Width * 1.25 (Örn: Belek)
             height = width * 1.25;
        }
        
        let scale = 1.0;
        const MIN_SCALE = 0.2; // Maskot tamamen kaybolmasın, en az kendi boyutunun %20 sine kadar ufalabilir.
        let resolved = false;
        
        // Scale Factor azaltılarak optimum çakışmasız sınır hedeflenir.
        while (scale > MIN_SCALE) {
            const currentWidth = width * scale;
            const currentHeight = height * scale;
            
            const box: BoundingBox = {
                id: mId, cx, cy, 
                width: currentWidth, 
                height: currentHeight,
                left: cx - currentWidth / 2,
                right: cx + currentWidth / 2,
                top: cy - currentHeight / 2,
                bottom: cy + currentHeight / 2
            };
            
            // Maskotun mevcut hali, diğer objelerden HERHANGİ BİRİNE değiyor mu? (En az 1px farkla)
            const isColliding = collisionObjects.some(otherBox => checkCollision(box, otherBox, 1));
            
            if (!isColliding) {
                results[mId] = box;
                resolved = true;
                break;
            }
            
            // Çakışıyorsa %2 küçült ve döngüde tekrar dene
            scale -= 0.02;
        }
        
        // Eğer hiçbir şekilde kurtaramadıysa (Örn: Sayfa tıklım tıklımsa), alabildiği son (minimum) haliyle sahneye bırak.
        if (!resolved) {
            const finalWidth = width * MIN_SCALE;
            const finalHeight = height * MIN_SCALE;
            results[mId] = {
                id: mId, cx, cy, width: finalWidth, height: finalHeight,
                left: cx - finalWidth / 2,
                right: cx + finalWidth / 2,
                top: cy - finalHeight / 2,
                bottom: cy + finalHeight / 2
            };
        }
    });

    return results;
}
