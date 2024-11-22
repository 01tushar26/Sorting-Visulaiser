const arrayContainer = document.getElementById('array-container');
const timeComplexityElement = document.getElementById('time-complexity');
const spaceComplexityElement = document.getElementById('space-complexity');
const muteButton = document.getElementById('mute'); // Mute button reference
let array = [];
let isSorting = false; // Flag to track whether sorting is active
let isMuted = false; // Flag to track whether sound is muted

// Audio Context for Sound
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Complexity details for each algorithm
const complexities = {
    bubble: { time: "O(n²)", space: "O(1)" },
    selection: { time: "O(n²)", space: "O(1)" },
    insertion: { time: "O(n²)", space: "O(1)" },
    merge: { time: "O(n log n)", space: "O(n)" },
    quick: { time: "O(n log n)", space: "O(log n)" },
};

// Generate random array
function generateArray() {
    if (isSorting) return; // Prevent generating a new array while sorting
    array = Array.from({ length: 20 }, () => Math.floor(Math.random() * 100) + 1);
    renderArray();
    resetComplexities();
}

// Reset complexity display
function resetComplexities() {
    timeComplexityElement.textContent = "N/A";
    spaceComplexityElement.textContent = "N/A";
}

// Render array as bars
function renderArray(highlightIndices = []) {
    arrayContainer.innerHTML = '';
    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = `${value * 3}px`;

        // Highlight bars being compared
        if (highlightIndices.includes(index)) {
            bar.style.backgroundColor = 'red';
        } else {
            bar.style.backgroundColor = '#4caf50';
        }

        arrayContainer.appendChild(bar);
    });
}

// Play sound based on bar height
function playSound(value) {
    if (isMuted) return; // Skip sound if muted

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine'; // You can use 'square', 'sawtooth', 'triangle', etc.
    oscillator.frequency.setValueAtTime(value * 10, audioContext.currentTime); // Frequency based on height
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime); // Volume

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1); // Short sound burst
}

// Delay function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Bubble Sort Visualization with Sound
async function bubbleSortVisualize() {
    const n = array.length;
    isSorting = true; // Mark sorting as active
    for (let i = 0; i < n - 1; i++) {
        if (!isSorting) break; // Stop sorting if the flag is turned off
        for (let j = 0; j < n - i - 1; j++) {
            if (!isSorting) break; // Stop sorting if the flag is turned off
            renderArray([j, j + 1]);
            playSound(array[j]); // Play sound for the current bar
            await delay(100); // Delay for visualization

            if (array[j] > array[j + 1]) {
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                renderArray([j, j + 1]);
                playSound(array[j + 1]); // Play sound for the swapped bar
                await delay(100);
            }
        }
    }
    isSorting = false; // Mark sorting as inactive
    renderArray(); // Final state
}

// Selection Sort Visualization with Sound
async function selectionSortVisualize() {
    const n = array.length;
    isSorting = true; // Mark sorting as active
    for (let i = 0; i < n - 1; i++) {
        if (!isSorting) break; // Stop sorting if the flag is turned off
        let minIndex = i;
        for (let j = i + 1; j < n; j++) {
            if (!isSorting) break; // Stop sorting if the flag is turned off
            renderArray([minIndex, j]);
            playSound(array[j]); // Play sound for the current bar
            await delay(100); // Delay for visualization

            if (array[j] < array[minIndex]) {
                minIndex = j;
                renderArray([minIndex, j]);
                playSound(array[minIndex]); // Play sound for the new min bar
                await delay(100);
            }
        }
        if (minIndex !== i) {
            [array[i], array[minIndex]] = [array[minIndex], array[i]];
            renderArray([i, minIndex]);
            playSound(array[i]); // Play sound for the swapped bar
            await delay(100);
        }
    }
    isSorting = false; // Mark sorting as inactive
    renderArray(); // Final state
}

// Update complexities when algorithm is selected
function updateComplexities(algorithm) {
    const { time, space } = complexities[algorithm];
    timeComplexityElement.textContent = time;
    spaceComplexityElement.textContent = space;
}

// Stop sorting
function stopSorting() {
    isSorting = false; // Set the flag to false to stop sorting
}

// Toggle mute state
function toggleMute() {
    isMuted = !isMuted; // Toggle mute state
    muteButton.textContent = isMuted ? "Unmute" : "Mute"; // Update button text
}

// Event Listeners
document.getElementById('generate').addEventListener('click', generateArray);
document.getElementById('sort').addEventListener('click', async () => {
    const algorithm = document.getElementById('algorithm').value;

    // Update complexities
    updateComplexities(algorithm);

    if (algorithm === 'bubble') {
        await bubbleSortVisualize();
    } else if (algorithm === 'selection') {
        await selectionSortVisualize();
    } else {
        alert('Visualization is only available for Bubble and Selection Sort.');
    }
});
document.getElementById('stop').addEventListener('click', stopSorting); // Stop button
muteButton.addEventListener('click', toggleMute); // Mute button listener

// Initial setup
generateArray();
