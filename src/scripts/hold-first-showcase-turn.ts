// The Studio hero's intro lands at 2.85s and its first change of screen would come at 3.6s, so this pauses the turn for
// long enough to leave five seconds between them. It can't be done in CSS: the turns' negative delays set the opening
// arrangement, and animation-* properties ignore animated variables. Without this script the first change just comes
// sooner, and under reduced motion there are no turns to hold.
const holdMilliseconds: number = 4250;

export function holdFirstShowcaseTurn(): void {
    const turns: ReadonlyArray<Animation> = document.getAnimations().filter((animation: Animation): boolean =>
        animation instanceof CSSAnimation && animation.animationName === 'showcase');

    turns.forEach((turn: Animation): void => {
        turn.pause();
    });
    setTimeout((): void => {
        turns.forEach((turn: Animation): void => {
            turn.play();
        });
    }, holdMilliseconds);
}
