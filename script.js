// Választható képméretek
const imageSizes = [
  { name: "9x13", width: 9, height: 13 },
  { name: "10x13", width: 10, height: 13 },
  { name: "10x15", width: 10, height: 15 },
  { name: "15x15", width: 15, height: 15 },
  { name: "15x20", width: 15, height: 20 },
  { name: "13x18", width: 13, height: 18 },
]

// Tesztkép paraméterek
const testImages = [
  { name: "Panoráma (fekvő)", width: 16350, height: 3744 },
  { name: "Panoráma (álló)", width: 3744, height: 16350 },
  { name: "Négyzet alakú kép", width: 4000, height: 4000 },
  { name: "4:3 arányú álló kép", width: 3024, height: 4032 },
  { name: "4:3 arányú fekvő kép", width: 4032, height: 3024 },
  { name: "2:3 arányú álló kép", width: 2000, height: 3000 },
  { name: "2:3 arányú fekvő kép", width: 3000, height: 2000 },
  { name: "16:9 arányú álló kép", width: 2160, height: 3840 },
  { name: "16:9 arányú fekvő kép", width: 3840, height: 2160 },
]

// Az űrlap konténer, ahol a radio gombokat megjelenítjük
const sizesContainer = document.getElementById("sizesContainer")
const imageContainer = document.getElementById("imageContainer")

// Radio gombok létrehozása és elhelyezése a formban (képméretek)
imageSizes.forEach((size, index) => {
  const radioInput = document.createElement("input")
  radioInput.type = "radio"
  radioInput.id = `size_${index}`
  radioInput.name = "imageSize"
  radioInput.dataset.width = size.width
  radioInput.dataset.height = size.height

  const radioLabel = document.createElement("label")
  radioLabel.classList.add("radio-label")
  radioLabel.setAttribute("for", `size_${index}`)
  radioLabel.textContent = size.name

  // Minden gombot egyetlen közös div-be helyezünk el
  sizesContainer.appendChild(radioInput)
  sizesContainer.appendChild(radioLabel)
})

// Radio gombok létrehozása és elhelyezése a formban (tesztképek)
testImages.forEach((image, index) => {
  const radioInput = document.createElement("input")
  radioInput.type = "radio"
  radioInput.id = `image_${index}`
  radioInput.name = "testImage"
  radioInput.dataset.width = image.width
  radioInput.dataset.height = image.height

  const radioLabel = document.createElement("label")
  radioLabel.classList.add("radio-label")
  radioLabel.setAttribute("for", `image_${index}`)
  radioLabel.textContent = image.name

  // Minden gombot egyetlen közös div-be helyezünk el
  imageContainer.appendChild(radioInput)
  imageContainer.appendChild(radioLabel)
})

let selectedImageSize = null
let selectedTestImage = null
let selectedCropType = "fill-in" // Alapértelmezett vágás típus

const workspace = document.getElementById("workspace")

// Eseménykezelő a méret és kép választáshoz
function handleSelectionChange() {
  if (selectedCropType === "fill-in") {
    if (selectedTestImage && selectedImageSize) {
      calculateOverlay() // Fill-in esetén számolunk overlay-t
    } else if (selectedTestImage) {
      displayImage() // Csak a képet jelenítjük meg, ha nincs képméret
    }
  } else if (selectedCropType === "fit-in") {
    if (selectedImageSize) {
      displayFitImage() // Fit-in esetén a képméret és a kép alapján dolgozunk
    }
  }
}

// Eseményfigyelők a méretválasztáshoz (csak fit-in esetén)
document.querySelectorAll('input[name="imageSize"]').forEach((radio) => {
  radio.addEventListener("change", (event) => {
    selectedImageSize = {
      width: parseInt(event.target.dataset.width),
      height: parseInt(event.target.dataset.height),
    }
    console.log("Kiválasztott képméret:", selectedImageSize)
    handleSelectionChange() // Újraszámolás
  })
})

// Eseményfigyelők a képfájl választáshoz
document.querySelectorAll('input[name="testImage"]').forEach((radio) => {
  radio.addEventListener("change", (event) => {
    selectedTestImage = {
      width: parseInt(event.target.dataset.width),
      height: parseInt(event.target.dataset.height),
    }
    console.log("Kiválasztott tesztkép:", selectedTestImage)
    handleSelectionChange() // Újraszámolás
  })
})

// Eseményfigyelők a vágás típusához
document.querySelectorAll('input[name="cropType"]').forEach((radio) => {
  radio.addEventListener("change", (event) => {
    selectedCropType = event.target.value
    console.log("Kiválasztott vágás típus:", selectedCropType)
    handleSelectionChange() // Újraszámolás vágás típus esetén is
  })
})

// Kép megjelenítése és középre igazítása fill-in logikával
function displayImage() {
  const originalWidth = selectedTestImage.width
  const originalHeight = selectedTestImage.height

  // Munkaterület méretei
  const maxWidth = 700
  const maxHeight = 700

  let newWidth, newHeight

  // Képarány kiszámítása
  const widthRatio = maxWidth / originalWidth
  const heightRatio = maxHeight / originalHeight

  // A legkisebb arányt választjuk a fill-in elv alapján, kerekítéssel
  const bestFitRatio = Math.min(widthRatio, heightRatio)

  newWidth = Math.round(originalWidth * bestFitRatio) // Pontosabb kerekítés
  newHeight = Math.round(originalHeight * bestFitRatio)

  // Kép div létrehozása
  const imageDiv = document.createElement("div")
  imageDiv.classList.add("testimage-bg")
  imageDiv.style.width = `${newWidth}px`
  imageDiv.style.height = `${newHeight}px`
  imageDiv.dataset.currentSize = `${newWidth}x${newHeight}`

  // A kép középre igazítása a workspace-ben
  imageDiv.style.position = "absolute"
  imageDiv.style.left = `${(maxWidth - newWidth) / 2}px`
  imageDiv.style.top = `${(maxHeight - newHeight) / 2}px`

  // A munkaterület frissítése - töröljük az előző képet
  workspace.innerHTML = ""
  workspace.appendChild(imageDiv)

  console.log(`Kép megjelenítve: ${newWidth}x${newHeight}`)
}

// Overlay kiszámítása az átméretezett képre (fill-in logika)
function calculateOverlay() {
  const originalWidth = selectedTestImage.width
  const originalHeight = selectedTestImage.height

  let finalWidth = selectedImageSize.width
  let finalHeight = selectedImageSize.height

  // Ha a kép tájolása és a képméret tájolása nem egyezik, "elforgatjuk" a képméretet
  if (originalWidth > originalHeight && finalWidth < finalHeight) {
    ;[finalWidth, finalHeight] = [finalHeight, finalWidth]
  } else if (originalHeight > originalWidth && finalWidth > finalHeight) {
    ;[finalWidth, finalHeight] = [finalHeight, finalWidth]
  }

  const selectedRatio = finalWidth / finalHeight
  const imageRatio = originalWidth / originalHeight

  // Újraszámoljuk a kép méretét, és töröljük az előző overlay-eket
  displayImage()
  const displayedWidth = parseFloat(
    document.querySelector(".testimage-bg").style.width,
  )
  const displayedHeight = parseFloat(
    document.querySelector(".testimage-bg").style.height,
  )

  // A kép pozíciója (középre igazítás miatt)
  const imageLeft = parseFloat(
    document.querySelector(".testimage-bg").style.left,
  )
  const imageTop = parseFloat(document.querySelector(".testimage-bg").style.top)

  // Ha a képméret és a kép arányai eltérnek, overlay megjelenítése
  if (selectedRatio !== imageRatio) {
    // Ha a kiválasztott méret szélesebb (aránya kisebb), bal/jobb overlay
    if (selectedRatio < imageRatio) {
      const excessWidth =
        displayedWidth - Math.floor(displayedHeight * selectedRatio)

      // Bal oldali overlay
      const leftOverlay = document.createElement("div")
      leftOverlay.classList.add("overlay")
      leftOverlay.style.width = `${Math.round(excessWidth / 2)}px`
      leftOverlay.style.height = `${displayedHeight}px`
      leftOverlay.style.position = "absolute"
      leftOverlay.style.left = `${imageLeft}px` // A kép bal széle
      leftOverlay.style.top = `${imageTop}px` // A kép teteje
      workspace.appendChild(leftOverlay)

      // Jobb oldali overlay
      const rightOverlay = document.createElement("div")
      rightOverlay.classList.add("overlay")
      rightOverlay.style.width = `${Math.round(excessWidth / 2)}px`
      rightOverlay.style.height = `${displayedHeight}px`
      rightOverlay.style.position = "absolute"
      rightOverlay.style.left = `${imageLeft + displayedWidth - Math.round(excessWidth / 2)}px` // A kép jobb széle
      rightOverlay.style.top = `${imageTop}px`
      workspace.appendChild(rightOverlay)
    }
    // Ha a kiválasztott méret magasabb (aránya nagyobb), felül/alul overlay
    else if (selectedRatio > imageRatio) {
      const excessHeight =
        displayedHeight - Math.floor(displayedWidth / selectedRatio)

      // Felső overlay
      const topOverlay = document.createElement("div")
      topOverlay.classList.add("overlay")
      topOverlay.style.width = `${displayedWidth}px`
      topOverlay.style.height = `${Math.round(excessHeight / 2)}px`
      topOverlay.style.position = "absolute"
      topOverlay.style.left = `${imageLeft}px`
      topOverlay.style.top = `${imageTop}px` // A kép teteje
      workspace.appendChild(topOverlay)

      // Alsó overlay
      const bottomOverlay = document.createElement("div")
      bottomOverlay.classList.add("overlay")
      bottomOverlay.style.width = `${displayedWidth}px`
      bottomOverlay.style.height = `${Math.round(excessHeight / 2)}px`
      bottomOverlay.style.position = "absolute"
      bottomOverlay.style.left = `${imageLeft}px`
      bottomOverlay.style.top = `${imageTop + displayedHeight - Math.round(excessHeight / 2)}px` // A kép alja
      workspace.appendChild(bottomOverlay)
    }
  }

  console.log("Overlay újraszámolva.")
}

// Fit-in logika megjelenítése
function displayFitImage() {
  const originalWidth = selectedTestImage.width
  const originalHeight = selectedTestImage.height
  let targetWidth = selectedImageSize.width
  let targetHeight = selectedImageSize.height

  // Munkaterület méretei (700x700)
  const maxWidth = 700
  const maxHeight = 700

  // Ha a kép tájolása és a képméret tájolása nem egyezik, forgatjuk a képméretet
  if (originalWidth > originalHeight && targetWidth < targetHeight) {
    ;[targetWidth, targetHeight] = [targetHeight, targetWidth]
  } else if (originalHeight > originalWidth && targetWidth > targetHeight) {
    ;[targetWidth, targetHeight] = [targetHeight, targetWidth]
  }

  // Képméret átszámítása a fit-in logikához (a kép teljesen belefér a keretbe)
  const widthRatio = maxWidth / targetWidth
  const heightRatio = maxHeight / targetHeight
  const bestFitRatio = Math.min(widthRatio, heightRatio)

  const displayWidth = Math.round(targetWidth * bestFitRatio)
  const displayHeight = Math.round(targetHeight * bestFitRatio)

  // Kép arányos igazítása a targetWidth és targetHeight méretekhez (fit-in logika)
  const widthRatioImage = displayWidth / originalWidth
  const heightRatioImage = displayHeight / originalHeight
  const bestFitImageRatio = Math.min(widthRatioImage, heightRatioImage)

  const newWidth = Math.round(originalWidth * bestFitImageRatio)
  const newHeight = Math.round(originalHeight * bestFitImageRatio)

  // Képméret (fehér lap) létrehozása
  const sizeDiv = document.createElement("div")
  sizeDiv.classList.add("size-bg")
  sizeDiv.style.width = `${displayWidth}px`
  sizeDiv.style.height = `${displayHeight}px`
  sizeDiv.style.backgroundColor = "white" // Fehér lap megjelenítése

  // A fehér lap középre igazítása a workspace-ben
  sizeDiv.style.position = "absolute"
  sizeDiv.style.left = `${(maxWidth - displayWidth) / 2}px`
  sizeDiv.style.top = `${(maxHeight - displayHeight) / 2}px`

  // Kép div létrehozása a fit-in logikához
  const imageDiv = document.createElement("div")
  imageDiv.classList.add("testimage-bg")
  imageDiv.style.width = `${newWidth}px`
  imageDiv.style.height = `${newHeight}px`

  // A kép középre igazítása a fehér lapon belül
  imageDiv.style.position = "absolute"
  imageDiv.style.left = `${(displayWidth - newWidth) / 2}px`
  imageDiv.style.top = `${(displayHeight - newHeight) / 2}px`

  // Munkaterület frissítése - töröljük az előző képet
  workspace.innerHTML = ""

  // Fehér lap hozzáadása a workspace-hez
  workspace.appendChild(sizeDiv)

  // Kép hozzáadása a fehér laphoz
  sizeDiv.appendChild(imageDiv)

  console.log(`Fit-in kép megjelenítve a fehér lapon: ${newWidth}x${newHeight}`)
}
