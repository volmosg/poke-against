This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## PokéAgainst -- Overview

This is a simple project to get a quick view of the strengths and weaknesses per Pokémon type. You can introduce up to two types.

## How to use it

- Introduce at least a Pokémon type. You can introduce up to two.
- Click "Analyze" to get an overview of the weaknesses and strengths of the Pokémon types you introduced.
- 2x = super effective, 1x = normal damage, 0.5x = not very effective, 0x = immune.

## Current limitations

- Rules for the latest generations are applied. Exceptions for gens 1-5 are not considered yet (e.g. psychic being immune to ghost).
- Pokémon abilities are not included yet.
- It's not possible yet to check for specific Pokémon (only their types).
